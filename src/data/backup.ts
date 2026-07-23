/**
 * Backup (export / import) — lossless round-trip of ALL habits + check-ins to/from a JSON file
 * (build-plan Phase 7; docs/architecture.md §2, §4, §8). No backend, no network: export writes a
 * local file the user shares/saves; import reads a user-picked file.
 *
 * Format (versioned for forward-compat): a top-level `version` + `exportedAt` + the full `habits`
 * and `checkins` rows exactly as stored (docs/architecture.md §4). Because rows are exported and
 * re-inserted verbatim (ids, cadence columns, `createdAt`, days), the round-trip is lossless.
 *
 * Import policy (decided Phase 7): **replace-all inside one transaction** — validate the file,
 * then in a single `withTransactionSync` delete every check-in + habit and insert the file's rows.
 * All-or-nothing: a mid-import failure rolls back, so a bad file never leaves partial data. Prefs
 * (theme/accent/week-start) are NOT part of the backup — they live in `key_value`, not the data.
 */
import { File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { expoDb, db } from "@/db/client";
import { checkins, habits, type Checkin, type Habit } from "@/db/schema";
import { logger } from "@/lib";

/** Bump when the on-disk shape changes incompatibly. Import rejects files with a higher version. */
export const BACKUP_VERSION = 1 as const;

/** The exported document shape. `habits`/`checkins` are the raw table rows (architecture §4). */
export interface BackupFile {
  version: number;
  exportedAt: string; // ISO timestamp
  habits: Habit[];
  checkins: Checkin[];
}

export interface ExportResult {
  /** `false` only when there is nothing to export (no habits) — the caller shows an empty note. */
  ok: boolean;
  habitCount: number;
  checkinCount: number;
  /** True when the OS share sheet couldn't be shown; the file was still written to `uri`. */
  sharedUnavailable?: boolean;
  uri?: string;
}

/**
 * Serialize every habit + check-in to a JSON file and offer it via the OS share sheet.
 * Returns `{ ok: false }` when there are no habits (nothing to back up). Throws on a real I/O
 * failure so the caller can show the failure Alert.
 */
export async function exportData(): Promise<ExportResult> {
  const [habitRows, checkinRows] = await Promise.all([
    db.select().from(habits),
    db.select().from(checkins),
  ]);

  if (habitRows.length === 0) {
    return { ok: false, habitCount: 0, checkinCount: 0 };
  }

  const payload: BackupFile = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    habits: habitRows,
    checkins: checkinRows,
  };

  try {
    // Cache dir: transient by design — the share sheet copies it wherever the user chooses.
    const file = new File(Paths.cache, backupFilename(payload.exportedAt));
    file.create({ overwrite: true });
    file.write(JSON.stringify(payload, null, 2));

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "Export Happit backup",
        UTI: "public.json",
      });
    }
    return {
      ok: true,
      habitCount: habitRows.length,
      checkinCount: checkinRows.length,
      sharedUnavailable: !canShare,
      uri: file.uri,
    };
  } catch (error) {
    logger.error("exportData failed", { error });
    throw error;
  }
}

/** A safe, dated filename, e.g. `happit-backup-2026-07-23.json`. */
function backupFilename(isoTimestamp: string): string {
  const day = isoTimestamp.slice(0, 10); // YYYY-MM-DD
  return `happit-backup-${day}.json`;
}

/** Discriminates why an import ended without restoring data. */
export type ImportOutcome =
  | { status: "canceled" }
  | { status: "invalid" } // not a Happit backup, or a newer version
  | { status: "imported"; habitCount: number; checkinCount: number };

/**
 * Pick a backup file, validate it, and — on a valid file — REPLACE all data with its contents in
 * one transaction. Returns a discriminated outcome so the caller shows the right Alert; a genuine
 * I/O/DB failure throws (distinct from the recoverable `invalid`, which leaves data untouched).
 */
export async function importData(): Promise<ImportOutcome> {
  // Platform split (verified from the installed expo source, incl. Expo Go's scoped services):
  // - Android: do NOT copy — the picker copies into the APP-level cache (`context.cacheDir/
  //   DocumentPicker/…`), which Expo Go's ScopedFilePermissionService denies READ on, so
  //   `File.text()` throws ERR_INVALID_PERMISSION. Reading the SAF `content://` URI in place
  //   works everywhere: `FileSystemPath.checkPermission` skips the path check for content URIs.
  // - iOS: keep the copy — it lands in the (Expo Go: experience-scoped) caches dir, which is
  //   readable, and the original security-scoped URL might not be readable after the picker closes.
  const picked = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: Platform.OS === "ios",
    multiple: false,
  });
  if (picked.canceled) return { status: "canceled" };

  const asset = picked.assets[0];
  let parsed: unknown;
  try {
    const text = await new File(asset.uri).text();
    parsed = JSON.parse(text);
  } catch (error) {
    // Unreadable / not JSON — a recoverable "invalid file", not a crash. No data touched.
    logger.error("importData: could not read/parse file", { error });
    return { status: "invalid" };
  }

  const backup = validateBackup(parsed);
  if (!backup) return { status: "invalid" };

  try {
    replaceAll(backup);
    return {
      status: "imported",
      habitCount: backup.habits.length,
      checkinCount: backup.checkins.length,
    };
  } catch (error) {
    logger.error("importData: restore transaction failed", { error });
    throw error;
  }
}

/**
 * Validate an unknown parsed value into a `BackupFile`, or return `null` if it isn't one (or is a
 * newer, unsupported version). Structural + per-row field checks so a malformed row can't slip in
 * and corrupt the DB. Lenient about extra fields; strict about the ones we insert.
 */
export function validateBackup(input: unknown): BackupFile | null {
  if (!isObject(input)) return null;
  const version = input.version;
  if (typeof version !== "number" || version > BACKUP_VERSION) return null; // newer file → reject
  if (!Array.isArray(input.habits) || !Array.isArray(input.checkins)) return null;

  const habitRows: Habit[] = [];
  for (const h of input.habits) {
    const row = validateHabit(h);
    if (!row) return null;
    habitRows.push(row);
  }

  const habitIds = new Set(habitRows.map((h) => h.id));
  const checkinRows: Checkin[] = [];
  for (const c of input.checkins) {
    const row = validateCheckin(c, habitIds);
    if (!row) return null;
    checkinRows.push(row);
  }

  return {
    version,
    exportedAt: typeof input.exportedAt === "string" ? input.exportedAt : new Date().toISOString(),
    habits: habitRows,
    checkins: checkinRows,
  };
}

const CADENCE_TYPES = new Set(["daily", "weekdays", "weekly_count"]);

function validateHabit(h: unknown): Habit | null {
  if (!isObject(h)) return null;
  if (typeof h.id !== "string" || typeof h.name !== "string") return null;
  if (typeof h.color !== "string" || typeof h.icon !== "string") return null;
  if (typeof h.cadenceType !== "string" || !CADENCE_TYPES.has(h.cadenceType)) return null;
  if (typeof h.sortOrder !== "number") return null;
  // Nullable columns: accept string|null / number|null, coerce absent → null.
  return {
    id: h.id,
    name: h.name,
    color: h.color,
    icon: h.icon,
    cadenceType: h.cadenceType as Habit["cadenceType"],
    weekdays: typeof h.weekdays === "string" ? h.weekdays : null,
    weeklyTarget: typeof h.weeklyTarget === "number" ? h.weeklyTarget : null,
    sortOrder: h.sortOrder,
    archivedAt: typeof h.archivedAt === "string" ? h.archivedAt : null,
    createdAt:
      typeof h.createdAt === "string" && h.createdAt.length > 0
        ? h.createdAt
        : new Date().toISOString(),
  };
}

function validateCheckin(c: unknown, habitIds: Set<string>): Checkin | null {
  if (!isObject(c)) return null;
  if (typeof c.id !== "string" || typeof c.habitId !== "string") return null;
  if (typeof c.day !== "string") return null;
  // Referential integrity: a check-in must point at a habit in the same backup (the FK would
  // otherwise reject the insert mid-transaction and abort the whole restore).
  if (!habitIds.has(c.habitId)) return null;
  return {
    id: c.id,
    habitId: c.habitId,
    day: c.day,
    createdAt:
      typeof c.createdAt === "string" && c.createdAt.length > 0
        ? c.createdAt
        : new Date().toISOString(),
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Replace all data with the backup's rows in ONE synchronous transaction (all-or-nothing).
 * Uses the raw `expoDb` sync API (`withTransactionSync` + `runSync`) — the expo-sqlite driver is
 * synchronous, so a single atomic transaction is the clean, deterministic way to do wipe+insert
 * without partial state. Delete order (checkins → habits) also respects the FK; insert order
 * (habits → checkins) satisfies it. `enableChangeListener` fires once on commit, so `useLiveQuery`
 * screens re-render with the restored data.
 */
function replaceAll(backup: BackupFile): void {
  expoDb.withTransactionSync(() => {
    expoDb.runSync("DELETE FROM checkins");
    expoDb.runSync("DELETE FROM habits");

    for (const h of backup.habits) {
      expoDb.runSync(
        "INSERT INTO habits " +
          "(id, name, color, icon, cadence_type, weekdays, weekly_target, sort_order, archived_at, created_at) " +
          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        h.id,
        h.name,
        h.color,
        h.icon,
        h.cadenceType,
        h.weekdays,
        h.weeklyTarget,
        h.sortOrder,
        h.archivedAt,
        h.createdAt,
      );
    }
    for (const c of backup.checkins) {
      expoDb.runSync(
        "INSERT INTO checkins (id, habit_id, day, created_at) VALUES (?, ?, ?, ?)",
        c.id,
        c.habitId,
        c.day,
        c.createdAt,
      );
    }
  });
}
