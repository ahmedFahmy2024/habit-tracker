/**
 * Today's habits — the composition that drives the Today screen (build-plan Phase 5).
 *
 * Composes `useHabits` (active, sorted) × `isScheduledOn(today)` × today's check-ins, and
 * derives each surviving habit's streak with the pure `computeStreak`. The streak is computed
 * HERE (once, memoized over the DB snapshots + today), not per-card: §9 wants streak/stats
 * off the render path, and computing it here needs each habit's full check-in history — which
 * we get from ONE `useAllCheckins` subscription rather than a live query per card.
 *
 * "today" is passed in by the screen (`todayString()` at the boundary) so the whole screen
 * agrees on one day; the domain never calls `new Date()` (docs/architecture.md §2/§7).
 */
import { useMemo } from "react";

import { cadenceOf, useHabits, type Habit } from "@/data/habits";
import { useAllCheckins, useCheckinsForDay } from "@/data/checkins";
import {
  computeStreak,
  isScheduledOn,
  type Cadence,
  type DayString,
} from "@/domain";

/** Streak counting unit — days for daily/weekdays, weeks for weekly_count (Phase-2 handoff). */
export type StreakUnit = "days" | "weeks";

export interface TodayHabit {
  habit: Habit;
  cadence: Cadence;
  /** Whether this habit is checked in for `today`. */
  checked: boolean;
  /** Current streak from `computeStreak` (today-grace applied). */
  streak: number;
  /** The unit `streak` is counted in, for labelling. */
  streakUnit: StreakUnit;
}

export interface TodayHabits {
  /** Scheduled-today habits in sort order, each with checked/streak resolved. */
  items: TodayHabit[];
  done: number;
  total: number;
  /** True once the underlying live queries have produced their first snapshot. */
  ready: boolean;
  /** True when there are no active habits at all (distinct from "none scheduled today"). */
  noHabits: boolean;
}

function streakUnitFor(cadence: Cadence): StreakUnit {
  return cadence.type === "weekly_count" ? "weeks" : "days";
}

export function useTodayHabits(today: DayString): TodayHabits {
  const { data: habits } = useHabits();
  const { data: todayCheckins } = useCheckinsForDay(today);
  const { data: allCheckins } = useAllCheckins();

  return useMemo(() => {
    // Set of habitIds checked in today (drives the CheckControl state).
    const checkedToday = new Set(todayCheckins.map((c) => c.habitId));

    // Group full history by habit so each streak is O(that habit's history) — §9.
    const daysByHabit = new Map<string, DayString[]>();
    for (const c of allCheckins) {
      const list = daysByHabit.get(c.habitId);
      if (list) list.push(c.day);
      else daysByHabit.set(c.habitId, [c.day]);
    }

    const items: TodayHabit[] = [];
    for (const habit of habits) {
      const cadence = cadenceOf(habit);
      if (!isScheduledOn(cadence, today)) continue; // not due today → excluded
      items.push({
        habit,
        cadence,
        checked: checkedToday.has(habit.id),
        streak: computeStreak(daysByHabit.get(habit.id) ?? [], cadence, today),
        streakUnit: streakUnitFor(cadence),
      });
    }

    const done = items.reduce((n, it) => (it.checked ? n + 1 : n), 0);
    return {
      items,
      done,
      total: items.length,
      ready: true,
      noHabits: habits.length === 0,
    };
  }, [habits, todayCheckins, allCheckins, today]);
}
