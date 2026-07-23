/**
 * Widget snapshot — the shared data channel between the app and the home-screen widget
 * (build-plan Phase 10, docs/library-docs.md §14).
 *
 * The Android widget's task handler runs in a **headless background task**: no React tree, no
 * `useLiveQuery`, no theme hooks. So it can't re-derive today's summary — it must read a
 * pre-computed snapshot. The app writes that snapshot on every check-in change; the widget reads
 * it to render the ring + top streak.
 *
 * ── Where the snapshot lives ────────────────────────────────────────────────────────────────
 * The same `key_value` table in `happit.db` (created by migration 0001) that backs the
 * preferences store — read/written with **synchronous** expo-sqlite SQL. Both the app and the
 * widget's headless JS task run in the same process against the same DB file, so a plain sync
 * read is enough; no App Group (iOS) / SharedPreferences (Android) plumbing is needed for the
 * Android path. (iOS WidgetKit — deferred — WILL need an App Group; see the Phase 10 handoff.)
 *
 * ── Snapshot ≠ streak derivation (critical, mirrors the reminders rule) ─────────────────────
 * The widget MUST NOT compute streaks. `computeTodaySnapshot` reuses the SAME numbers the Today
 * screen already derived (done/total via check-ins, top streak via `computeStreak`) and freezes
 * them into the snapshot. The widget only reads. Streaks stay purely check-in-derived
 * (docs/architecture.md §7.3).
 */
import { expoDb } from "@/db/client";
import { logger } from "@/lib";
import { habitColors, type HabitColorKey } from "@/theme/habitColors";
import type { ColorScheme } from "@/theme/colors";
import type { StreakUnit, TodayHabits } from "./today";

/** The single `key_value` row key the snapshot JSON is stored under. */
const SNAPSHOT_KEY = "widget_snapshot";

/**
 * The frozen today-summary the widget renders. Everything the native widget needs, resolved to
 * plain values (no hooks, no theme lookups at render time) so the headless task can draw it.
 */
export interface WidgetSnapshot {
  /** Schema version — lets a future widget guard against an older/newer snapshot shape. */
  version: 1;
  /** The local calendar day this summary is for ('YYYY-MM-DD'). Drives day-rollover detection. */
  date: string;
  /** Habits scheduled today that are checked off. */
  done: number;
  /** Habits scheduled today in total. */
  total: number;
  /** The single highest current streak among today's habits (0 when none). */
  topStreak: number;
  /** The unit `topStreak` is counted in, for the label. */
  topStreakUnit: StreakUnit;
  /** Name of the habit that owns `topStreak` (empty when there's no streak). */
  topHabitName: string;
  /** Resolved accent stroke color (hex) for the ring — the user's global accent, light scheme. */
  accentColor: string;
}

/**
 * Compute the frozen snapshot from the (already-derived) Today summary + the chosen accent. This
 * does NOT re-run any streak/scheduling logic beyond what `useTodayHabits` produced — it picks the
 * single top streak out of the list the screen already has.
 *
 * The accent is resolved for the **light** scheme only: the Android widget renders its own
 * light/dark variants via the task handler, and light-scheme accents are the AA-on-white values
 * (docs/theme/habitColors.ts). The widget re-tints per its own system dark mode; the stored hex is
 * the reference accent, and the widget's dark variant uses a fixed dark palette (see the widget).
 */
export function computeTodaySnapshot(
  today: string,
  summary: Pick<TodayHabits, "items" | "done" | "total">,
  accentKey: HabitColorKey,
): WidgetSnapshot {
  // Pick the highest current streak among today's habits (ties → first in sort order).
  let top = { streak: 0, unit: "days" as StreakUnit, name: "" };
  for (const it of summary.items) {
    if (it.streak > top.streak) {
      top = { streak: it.streak, unit: it.streakUnit, name: it.habit.name };
    }
  }

  const scheme: ColorScheme = "light";
  return {
    version: 1,
    date: today,
    done: summary.done,
    total: summary.total,
    topStreak: top.streak,
    topStreakUnit: top.unit,
    topHabitName: top.name,
    accentColor: habitColors(scheme, accentKey).accent,
  };
}

/** Write the snapshot to `key_value` synchronously (upsert). Never throws. */
export function writeSnapshot(snapshot: WidgetSnapshot): void {
  try {
    expoDb.runSync(
      "INSERT INTO key_value (key, value) VALUES (?, ?) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      SNAPSHOT_KEY,
      JSON.stringify(snapshot),
    );
  } catch (error) {
    logger.error("writeSnapshot failed", { error });
  }
}

/**
 * Read the current snapshot synchronously, or `null` when there is none / it's unreadable. Used by
 * the widget task handler (headless — must be sync + defensive). Validates the shape defensively so
 * a corrupt/older row renders an empty widget rather than crashing the background task.
 */
export function readSnapshot(): WidgetSnapshot | null {
  let raw: string | null = null;
  try {
    const row = expoDb.getFirstSync<{ value: string }>(
      "SELECT value FROM key_value WHERE key = ?",
      SNAPSHOT_KEY,
    );
    raw = row?.value ?? null;
  } catch {
    // Table may not exist yet (pre-migration) — treat as "no snapshot".
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<WidgetSnapshot>;
    if (
      parsed.version !== 1 ||
      typeof parsed.date !== "string" ||
      typeof parsed.done !== "number" ||
      typeof parsed.total !== "number" ||
      typeof parsed.topStreak !== "number" ||
      (parsed.topStreakUnit !== "days" && parsed.topStreakUnit !== "weeks") ||
      typeof parsed.topHabitName !== "string" ||
      typeof parsed.accentColor !== "string"
    ) {
      return null;
    }
    return parsed as WidgetSnapshot;
  } catch (error) {
    logger.error("readSnapshot: corrupt snapshot JSON", { error });
    return null;
  }
}
