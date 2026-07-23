/**
 * Habit data access — reactive reads (useLiveQuery) + intention-named async writes
 * (docs/architecture.md §5; docs/code-standards.md §4). Also the single place that maps the
 * flat cadence columns (§4) onto the domain's normalized `Cadence` union (§7), so the domain
 * never sees the DB shape.
 */
import { asc, eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { db } from "@/db/client";
import { habits, type Habit, type NewHabit } from "@/db/schema";
import type { Cadence, Weekday } from "@/domain";
import { logger, newId } from "@/lib";

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
  /** Sort position; defaults to append-at-end when omitted by the caller. */
  sortOrder?: number;
}

/** Create a new habit. Returns the generated id. */
export async function createHabit(input: CreateHabitInput): Promise<string> {
  try {
    const id = newId();
    await db.insert(habits).values({
      id,
      name: input.name,
      color: input.color,
      icon: input.icon,
      sortOrder: input.sortOrder ?? 0,
      ...cadenceColumns(input.cadence),
    });
    return id;
  } catch (error) {
    logger.error("createHabit failed", { input, error });
    throw error;
  }
}

/** Soft-archive a habit (keeps its history; hidden from active lists). */
export async function archiveHabit(id: string): Promise<void> {
  try {
    await db
      .update(habits)
      .set({ archivedAt: new Date().toISOString() })
      .where(eq(habits.id, id));
  } catch (error) {
    logger.error("archiveHabit failed", { id, error });
    throw error;
  }
}

export type { Habit };
