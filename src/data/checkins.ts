/**
 * Check-in data access — reactive reads (useLiveQuery) + intention-named async writes
 * (docs/architecture.md §5, §7.4; docs/code-standards.md §4). Screens never import `db`;
 * they go through these hooks/functions. Rows are immutable snapshots — never mutated.
 */
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { db } from "@/db/client";
import { checkins, type Checkin } from "@/db/schema";
import { logger, newId } from "@/lib";
import type { DayString } from "@/domain";

/** Live check-ins for one habit (all history), newest day first. */
export function useHabitCheckins(habitId: string) {
  return useLiveQuery(
    db.select().from(checkins).where(eq(checkins.habitId, habitId)),
    [habitId],
  );
}

/** Live check-ins for a single day across all habits (drives the Today screen). */
export function useCheckinsForDay(day: DayString) {
  return useLiveQuery(db.select().from(checkins).where(eq(checkins.day, day)), [
    day,
  ]);
}

/**
 * Toggle a habit's check-in for a day: delete the row if it exists, else insert one
 * (docs/architecture.md §7.4). The `uniq_habit_day` unique index is the real guarantee
 * against double-taps/races. Returns the resulting state so callers can fire the right
 * haptic. Backfilling past days is allowed; guarding against future days is the caller's job.
 */
export async function toggleCheckin(
  habitId: string,
  day: DayString,
): Promise<{ checked: boolean }> {
  try {
    const existing = await db
      .select({ id: checkins.id })
      .from(checkins)
      .where(and(eq(checkins.habitId, habitId), eq(checkins.day, day)));

    if (existing.length > 0) {
      await db
        .delete(checkins)
        .where(and(eq(checkins.habitId, habitId), eq(checkins.day, day)));
      return { checked: false };
    }

    // onConflictDoNothing: if a concurrent insert already created the row, treat as checked
    // rather than throwing on the unique index.
    await db
      .insert(checkins)
      .values({ id: newId(), habitId, day })
      .onConflictDoNothing();
    return { checked: true };
  } catch (error) {
    logger.error("toggleCheckin failed", { habitId, day, error });
    throw error;
  }
}

export type { Checkin };
