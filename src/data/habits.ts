/**
 * Habit data access — reactive reads (useLiveQuery) + intention-named async writes
 * (docs/architecture.md §5; docs/code-standards.md §4). Also the single place that maps the
 * flat cadence columns (§4) onto the domain's normalized `Cadence` union (§7), so the domain
 * never sees the DB shape.
 */
import { asc, eq, isNull, max } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { db } from "@/db/client";
import { habits, type Habit, type NewHabit } from "@/db/schema";
import type { Cadence, Weekday } from "@/domain";
import {
  cancelHabitReminder,
  logger,
  newId,
  rescheduleAll,
  scheduleHabitReminder,
  type ReminderHabit,
} from "@/lib";
import { remindersEnabled } from "@/store";

/** Live list of active (non-archived) habits, in user sort order. */
export function useHabits() {
  return useLiveQuery(
    db
      .select()
      .from(habits)
      .where(isNull(habits.archivedAt))
      .orderBy(asc(habits.sortOrder)),
  );
}

/** Live single habit by id (for the detail screen). */
export function useHabit(id: string) {
  return useLiveQuery(db.select().from(habits).where(eq(habits.id, id)), [id]);
}

/**
 * Map a flat habit row onto the domain `Cadence` union. `weekdays`/`weeklyTarget` are only
 * meaningful for their cadence type; a malformed row falls back to a safe shape rather than
 * throwing, and is logged.
 */
export function cadenceOf(habit: Habit): Cadence {
  switch (habit.cadenceType) {
    case "daily":
      return { type: "daily" };
    case "weekdays":
      return { type: "weekdays", weekdays: parseWeekdays(habit.weekdays) };
    case "weekly_count":
      return {
        type: "weekly_count",
        weeklyTarget: habit.weeklyTarget ?? 1,
      };
  }
}

/**
 * Map a habit row → the normalized `ReminderHabit` the notifications lib needs (cadence union +
 * reminder fields). Keeps `src/lib/notifications.ts` decoupled from the Drizzle row shape, exactly
 * like `cadenceOf` keeps the domain decoupled.
 */
export function reminderHabitOf(habit: Habit): ReminderHabit {
  return {
    id: habit.id,
    name: habit.name,
    cadence: cadenceOf(habit),
    reminderEnabled: habit.reminderEnabled,
    reminderTime: habit.reminderTime,
    archivedAt: habit.archivedAt,
  };
}

/** Parse the CSV '1,3,5' weekday column into a typed, de-duplicated weekday list. */
function parseWeekdays(csv: string | null): Weekday[] {
  if (!csv) return [];
  const out = new Set<Weekday>();
  for (const part of csv.split(",")) {
    const n = Number(part.trim());
    if (Number.isInteger(n) && n >= 0 && n <= 6) out.add(n as Weekday);
  }
  return [...out].sort((a, b) => a - b);
}

/** Serialize a domain cadence back to the flat columns for insert/update. */
function cadenceColumns(
  cadence: Cadence,
): Pick<NewHabit, "cadenceType" | "weekdays" | "weeklyTarget"> {
  switch (cadence.type) {
    case "daily":
      return { cadenceType: "daily", weekdays: null, weeklyTarget: null };
    case "weekdays":
      return {
        cadenceType: "weekdays",
        weekdays: [...cadence.weekdays].sort((a, b) => a - b).join(","),
        weeklyTarget: null,
      };
    case "weekly_count":
      return {
        cadenceType: "weekly_count",
        weekdays: null,
        weeklyTarget: cadence.weeklyTarget,
      };
  }
}

export interface CreateHabitInput {
  name: string;
  color: string; // token key, e.g. 'green' (NOT a hex)
  icon: string; // icon-set name
  cadence: Cadence;
  /** Local reminder (Phase 9). */
  reminderEnabled: boolean;
  /** Minutes past midnight (0..1439), or null when the reminder is off. */
  reminderTime: number | null;
  /** Sort position; defaults to append-at-end when omitted by the caller. */
  sortOrder?: number;
}

/**
 * Create a new habit. Returns the generated id. Defaults to append-at-end sort order. Schedules
 * the OS reminder if one was enabled — the DB write is the source of truth; scheduling is a
 * side-effect that reads the (just-written) habit but never writes back (streaks stay
 * check-in-derived, build-plan Phase 9).
 */
export async function createHabit(input: CreateHabitInput): Promise<string> {
  try {
    const id = newId();
    await db.insert(habits).values({
      id,
      name: input.name,
      color: input.color,
      icon: input.icon,
      reminderEnabled: input.reminderEnabled,
      reminderTime: input.reminderTime,
      sortOrder: input.sortOrder ?? (await nextSortOrder()),
      ...cadenceColumns(input.cadence),
    });
    await syncReminder(id);
    return id;
  } catch (error) {
    logger.error("createHabit failed", { input, error });
    throw error;
  }
}

/** Fields an edit can change. `sortOrder`/`archivedAt` are managed by their own writers. */
export interface UpdateHabitInput {
  name: string;
  color: string; // token key, e.g. 'green' (NOT a hex)
  icon: string; // icon-set name
  cadence: Cadence;
  /** Local reminder (Phase 9). */
  reminderEnabled: boolean;
  /** Minutes past midnight (0..1439), or null when the reminder is off. */
  reminderTime: number | null;
}

/**
 * Update an existing habit's editable fields (name, color, icon, cadence, reminder). Reorder and
 * archive have their own intention-named writers so this never touches `sortOrder`/`archivedAt`.
 * Reschedules the OS reminder after the write (cancel-then-schedule inside `syncReminder` ⇒ a
 * cadence/time/enabled change reschedules with no duplicates — build-plan Phase 9).
 */
export async function updateHabit(
  id: string,
  input: UpdateHabitInput,
): Promise<void> {
  try {
    await db
      .update(habits)
      .set({
        name: input.name,
        color: input.color,
        icon: input.icon,
        reminderEnabled: input.reminderEnabled,
        reminderTime: input.reminderTime,
        ...cadenceColumns(input.cadence),
      })
      .where(eq(habits.id, id));
    await syncReminder(id);
  } catch (error) {
    logger.error("updateHabit failed", { id, input, error });
    throw error;
  }
}

/**
 * (Re)schedule a single habit's reminder from its current DB state. Reads the row back so it
 * always reflects exactly what was persisted, then hands the normalized view to the notifications
 * lib (which cancels this habit's existing ids first → no duplicates). A no-op DB read failure
 * or a disabled/archived habit results in the reminder being cancelled, never left stale.
 */
async function syncReminder(id: string): Promise<void> {
  // Master switch off ⇒ never schedule (the habit's own toggle is preserved for when it's back on).
  if (!remindersEnabled()) {
    await cancelHabitReminder(id);
    return;
  }
  const rows = await db.select().from(habits).where(eq(habits.id, id));
  const habit = rows[0];
  if (!habit) {
    await cancelHabitReminder(id);
    return;
  }
  await scheduleHabitReminder(reminderHabitOf(habit));
}

/**
 * Reconcile EVERY habit's reminder against the OS in one pass — the single reschedule entry point
 * for bulk/ambient triggers: app foreground, an import, and the Settings master-switch toggle
 * (build-plan Phase 9). Reads all habits fresh, gates on the master switch (off ⇒ cancel-all), and
 * hands the normalized views to `rescheduleAll` (which cancels-all then reschedules → no
 * duplicates). Never throws (delegates swallow errors) so a caller can fire-and-forget.
 */
export async function reconcileReminders(): Promise<void> {
  try {
    if (!remindersEnabled()) {
      // Master off: clear the slate. `rescheduleAll([])` cancels all and schedules nothing.
      await rescheduleAll([]);
      return;
    }
    const rows = await db.select().from(habits);
    await rescheduleAll(rows.map(reminderHabitOf));
  } catch (error) {
    logger.error("reconcileReminders failed", { error });
  }
}

/**
 * Persist a new ordering. `ids` is the full active list in the user's chosen order; each
 * habit's `sortOrder` is set to its index so `useHabits` (ordered by `sortOrder`) reflects it.
 * The expo-sqlite driver runs synchronously, so we issue the row updates in sequence.
 */
export async function reorderHabits(ids: string[]): Promise<void> {
  try {
    for (let i = 0; i < ids.length; i++) {
      await db
        .update(habits)
        .set({ sortOrder: i })
        .where(eq(habits.id, ids[i]));
    }
  } catch (error) {
    logger.error("reorderHabits failed", { ids, error });
    throw error;
  }
}

/** Next append position: one past the current max `sortOrder` (0 when there are no habits). */
async function nextSortOrder(): Promise<number> {
  const rows = await db
    .select({ maxOrder: max(habits.sortOrder) })
    .from(habits);
  return (rows[0]?.maxOrder ?? -1) + 1;
}

/**
 * Soft-archive a habit (keeps its history; hidden from active lists). Cancels any scheduled
 * reminder — an archived habit must never nudge (build-plan Phase 9). The reminder columns are
 * left intact so unarchiving (a future feature) could restore it.
 */
export async function archiveHabit(id: string): Promise<void> {
  try {
    await db
      .update(habits)
      .set({ archivedAt: new Date().toISOString() })
      .where(eq(habits.id, id));
    await cancelHabitReminder(id);
  } catch (error) {
    logger.error("archiveHabit failed", { id, error });
    throw error;
  }
}

/**
 * Hard-delete a habit and all its history. The `checkins.habitId` FK is `onDelete: 'cascade'`
 * (docs/architecture.md §4), so removing the habit row also removes its check-ins — no separate
 * delete needed. Permanent and unrecoverable; the caller must confirm (docs/architecture.md
 * §7.4 backfill is per-day; this removes the whole habit). Contrast with `archiveHabit`, which
 * only hides it.
 */
export async function deleteHabit(id: string): Promise<void> {
  try {
    // Cancel first so a scheduled reminder can't fire for a habit that no longer exists.
    await cancelHabitReminder(id);
    await db.delete(habits).where(eq(habits.id, id));
  } catch (error) {
    logger.error("deleteHabit failed", { id, error });
    throw error;
  }
}

export type { Habit };
