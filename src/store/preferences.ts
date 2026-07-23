/**
 * Preferences store — the ONE documented exception to "the database is the state"
 * (docs/architecture.md §2). Habits/check-ins live in SQLite; UI preferences (theme mode,
 * accent key, week-start) live here in a tiny zustand store.
 *
 * Persistence (decided Phase 7, docs/library-docs.md §8): a `key_value` table in the SAME
 * `happit.db`, read/written with **synchronous** expo-sqlite SQL — NOT the zustand `persist`
 * middleware / AsyncStorage. Because the read is synchronous, the store is already hydrated on
 * the very first render, so there is **no theme flash** on cold start (async rehydration would
 * paint the default theme first, then flip). Setters write-through synchronously.
 *
 * Week-start is DISPLAY-ONLY (docs/architecture.md §7.2/§7.3). It reorders weekday chips and the
 * heatmap legend; it must NEVER touch stored `Weekday` numbers, `isScheduledOn`, ISO-week math,
 * or streaks. See `src/lib/weekOrder.ts`.
 */
import { create } from "zustand";

import { expoDb } from "@/db/client";
import { logger } from "@/lib";
// Import directly from the specific module (not the `@/theme` barrel) to avoid a require cycle:
// the barrel re-exports `ThemeSync`, which imports this store. `habitColors` has no such back-edge.
import { HABIT_COLOR_KEYS, type HabitColorKey } from "@/theme/habitColors";

/** Theme mode: explicit light/dark, or follow the OS (`system`). */
export type ThemeMode = "light" | "dark" | "system";
/** Which weekday a displayed week starts on: 0 = Sunday, 1 = Monday. Display-only. */
export type WeekStart = 0 | 1;

export interface Preferences {
  themeMode: ThemeMode;
  accentKey: HabitColorKey;
  weekStart: WeekStart;
}

/** The at-install defaults (used before anything is persisted, or if a value is corrupt). */
export const DEFAULT_PREFERENCES: Preferences = {
  themeMode: "system",
  accentKey: "green",
  weekStart: 0,
};

/** The single row key under which the preferences object is JSON-stored in `key_value`. */
const PREFS_KEY = "preferences";

/* ------------------------------------------------------------------ sync persistence */

type Row = { value: string };

/**
 * Read + validate the persisted preferences synchronously. Defensive on every axis:
 *   - the `key_value` table may not exist yet on a fresh install (migrations run in the
 *     MigrationGate, which can be *after* this module loads) → treat as "no prefs, use defaults";
 *   - the JSON may be absent or corrupt → defaults;
 *   - individual fields are validated against their known enums → unknown values fall back.
 * Never throws; the worst case is returning the defaults.
 */
function readPreferences(): Preferences {
  let raw: string | null = null;
  try {
    const row = expoDb.getFirstSync<Row>(
      "SELECT value FROM key_value WHERE key = ?",
      PREFS_KEY,
    );
    raw = row?.value ?? null;
  } catch {
    // Table not created yet (pre-migration) — fine, use defaults for the first paint.
    return DEFAULT_PREFERENCES;
  }
  if (!raw) return DEFAULT_PREFERENCES;

  try {
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      themeMode: isThemeMode(parsed.themeMode)
        ? parsed.themeMode
        : DEFAULT_PREFERENCES.themeMode,
      accentKey: isAccentKey(parsed.accentKey)
        ? parsed.accentKey
        : DEFAULT_PREFERENCES.accentKey,
      weekStart: isWeekStart(parsed.weekStart)
        ? parsed.weekStart
        : DEFAULT_PREFERENCES.weekStart,
    };
  } catch (error) {
    logger.error("readPreferences: corrupt prefs JSON, using defaults", { error });
    return DEFAULT_PREFERENCES;
  }
}

/** Write the whole preferences object back synchronously (upsert on the primary key). */
function writePreferences(prefs: Preferences): void {
  try {
    expoDb.runSync(
      "INSERT INTO key_value (key, value) VALUES (?, ?) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      PREFS_KEY,
      JSON.stringify(prefs),
    );
  } catch (error) {
    // A failed write must not crash the app; the in-memory state still updates so the UI
    // stays consistent for the session. (This should only ever fire pre-migration.)
    logger.error("writePreferences failed", { error });
  }
}

function isThemeMode(v: unknown): v is ThemeMode {
  return v === "light" || v === "dark" || v === "system";
}
function isWeekStart(v: unknown): v is WeekStart {
  return v === 0 || v === 1;
}
function isAccentKey(v: unknown): v is HabitColorKey {
  return typeof v === "string" && (HABIT_COLOR_KEYS as readonly string[]).includes(v);
}

/* ------------------------------------------------------------------ store */

interface PreferencesState extends Preferences {
  setThemeMode: (mode: ThemeMode) => void;
  setAccentKey: (key: HabitColorKey) => void;
  setWeekStart: (weekStart: WeekStart) => void;
  /**
   * Re-read from the DB. Call once after migrations succeed, in case this module loaded (and
   * hydrated to defaults) before the `key_value` table existed on a fresh install.
   */
  hydrate: () => void;
}

export const usePreferences = create<PreferencesState>((set, get) => ({
  ...readPreferences(),

  setThemeMode: (themeMode) => {
    set({ themeMode });
    writePreferences({ ...get(), themeMode });
  },
  setAccentKey: (accentKey) => {
    set({ accentKey });
    writePreferences({ ...get(), accentKey });
  },
  setWeekStart: (weekStart) => {
    set({ weekStart });
    writePreferences({ ...get(), weekStart });
  },

  hydrate: () => {
    const prefs = readPreferences();
    const cur = get();
    // Only update if the DB actually differs from what we hydrated at module load, to avoid a
    // needless re-render on every boot.
    if (
      prefs.themeMode !== cur.themeMode ||
      prefs.accentKey !== cur.accentKey ||
      prefs.weekStart !== cur.weekStart
    ) {
      set(prefs);
    }
  },
}));
