/**
 * Habit stats — the composition that drives the habit-detail screen (build-plan Phase 6).
 *
 * Wraps `useHabit` + `useHabitCheckins` and derives everything the detail screen shows from the
 * PURE domain functions: current streak (`computeStreak`), best streak (`bestStreak`),
 * completion rate over the visible window (`completionRate`), the heatmap buckets
 * (`heatmapBuckets`), and the raw all-time check-in count. Streaks/stats are NEVER stored — they
 * are recomputed here so they can't drift (docs/architecture.md §2).
 *
 * All four computations run in ONE `useMemo`, off the render path, keyed on
 * `(checkins snapshot, today, cadence)` per §9's `(habitId, today, checkinsVersion)` rule —
 * the same pattern `useTodayHabits` uses. `today` is passed in by the screen (`todayString()`
 * at the boundary) so the whole screen agrees on one day; the domain never calls `new Date()`.
 */
import { useMemo } from "react";

import { cadenceOf, useHabit, type Habit } from "@/data/habits";
import { useHabitCheckins } from "@/data/checkins";
import {
  bestStreak,
  completionRate,
  computeStreak,
  heatmapBuckets,
  subtractDays,
  type Cadence,
  type DayString,
  type HeatmapBucket,
} from "@/domain";
import { heatmap as heatmapTokens } from "@/theme";

/** Streak counting unit — days for daily/weekdays, weeks for weekly_count (Phase-2 handoff). */
export type StreakUnit = "days" | "weeks";

export interface HabitStats {
  /** The habit row (undefined until the live query resolves, or if it was deleted). */
  habit: Habit | undefined;
  cadence: Cadence | undefined;
  /** Current streak (today-grace applied), in `streakUnit`. */
  streak: number;
  /** Longest streak anywhere in history, in `streakUnit`. */
  best: number;
  /** The unit `streak`/`best` are counted in. */
  streakUnit: StreakUnit;
  /** Completion fraction (0..1) over the visible heatmap window (scheduled days only). */
  completion: number;
  /** All-time count of check-ins for this habit. */
  totalCheckins: number;
  /** One bucket per day in the visible window, chronological (drives the Heatmap). */
  buckets: HeatmapBucket[];
  /** The inclusive visible window, [from, to] where to === today. */
  from: DayString;
  to: DayString;
  /** False before the first live-query snapshot resolves (drives the loading gap). */
  ready: boolean;
}

function streakUnitFor(cadence: Cadence): StreakUnit {
  return cadence.type === "weekly_count" ? "weeks" : "days";
}

export function useHabitStats(id: string, today: DayString): HabitStats {
  const { data: habitRows, updatedAt: habitAt } = useHabit(id);
  const { data: checkins, updatedAt: checkinsAt } = useHabitCheckins(id);

  const habit = habitRows[0];

  return useMemo(() => {
    // Visible window: the last N weeks ending today (backfill is limited to this range).
    const to = today;
    const from = subtractDays(today, heatmapTokens.weeks * 7 - 1);

    if (!habit) {
      return {
        habit: undefined,
        cadence: undefined,
        streak: 0,
        best: 0,
        streakUnit: "days" as StreakUnit,
        completion: 0,
        totalCheckins: 0,
        buckets: [],
        from,
        to,
        // "ready" means the habit live query has produced a snapshot; if it has and there's
        // still no row, the habit genuinely doesn't exist (deleted / bad id) — a not-found.
        ready: habitAt !== undefined,
      };
    }

    const cadence = cadenceOf(habit);
    const days = checkins.map((c) => c.day);

    return {
      habit,
      cadence,
      streak: computeStreak(days, cadence, today),
      best: bestStreak(days, cadence, today),
      streakUnit: streakUnitFor(cadence),
      completion: completionRate(days, cadence, from, to),
      totalCheckins: days.length,
      buckets: heatmapBuckets(days, cadence, from, to),
      from,
      to,
      ready: true,
    };
    // Keyed on the live-query snapshots (updatedAt), today, and the habit's cadence columns —
    // §9's (habitId, today, checkinsVersion). `habit`/`checkins` refs are stable within a
    // snapshot, so depending on updatedAt avoids recomputing on unrelated re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitAt, checkinsAt, today, id]);
}
