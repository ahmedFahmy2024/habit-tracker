/**
 * Stats — completion rate, best streak, and heatmap buckets (docs/architecture.md §7.3, §9).
 *
 * Pure and O(history): input = the habit's checked day strings + cadence + a date range /
 * `today`; output = plain numbers/data. Best streak is NEVER stored — it's recomputed from
 * check-ins so it can't drift (§2). No React/DB/expo imports.
 */
import { isScheduledOn } from "./cadence";
import { isoWeekKey, plusDays, subtractDays } from "./dateUtil";
import type { Cadence, DayString } from "./types";

const MAX_SPAN_DAYS = 366 * 20;

/** Inclusive list of day strings from `from`..`to` (chronological). Empty if from > to. */
function daysInRange(from: DayString, to: DayString): DayString[] {
  if (from > to) return [];
  const out: DayString[] = [];
  let cursor = to;
  for (let i = 0; i < MAX_SPAN_DAYS && cursor >= from; i++) {
    out.push(cursor);
    cursor = subtractDays(cursor, 1);
  }
  return out.reverse();
}

/**
 * Fraction of *scheduled* days in [from, to] that were satisfied. Denominator is scheduled
 * days only (an unscheduled day is neither credit nor penalty). Returns 0 (not NaN) when the
 * range contains no scheduled days.
 */
export function completionRate(
  checkinDays: readonly DayString[],
  cadence: Cadence,
  from: DayString,
  to: DayString,
): number {
  const checked = new Set(checkinDays);
  let scheduled = 0;
  let satisfied = 0;
  for (const day of daysInRange(from, to)) {
    if (!isScheduledOn(cadence, day)) continue;
    scheduled++;
    if (checked.has(day)) satisfied++;
  }
  return scheduled === 0 ? 0 : satisfied / scheduled;
}

/**
 * The longest streak anywhere in history, using the same satisfaction rules as
 * computeStreak (§7.3) but scanning forward once over the whole range. For daily/weekdays we
 * sweep scheduled days and track the running run; for weekly_count we sweep ISO weeks.
 *
 * `today` bounds the scan (future days are excluded) and, for daily/weekdays, applies the
 * same today-grace as the current streak: an unchecked scheduled `today` doesn't reset the
 * run (it simply isn't counted), so the current run still shows as best when it is the best.
 */
export function bestStreak(
  checkinDays: readonly DayString[],
  cadence: Cadence,
  today: DayString,
): number {
  if (checkinDays.length === 0) return 0;
  return cadence.type === "weekly_count"
    ? bestWeeklyStreak(checkinDays, cadence.weeklyTarget, today)
    : bestDailyStreak(checkinDays, cadence, today);
}

function bestDailyStreak(
  checkinDays: readonly DayString[],
  cadence: Cadence,
  today: DayString,
): number {
  const checked = new Set(checkinDays);
  // Scan from the earliest check-in up to today.
  const earliest = checkinDays.reduce((min, d) => (d < min ? d : min), today);

  let best = 0;
  let run = 0;
  let cursor = earliest;
  for (let i = 0; i < MAX_SPAN_DAYS && cursor <= today; i++) {
    if (isScheduledOn(cadence, cursor)) {
      if (checked.has(cursor)) {
        run++;
        if (run > best) best = run;
      } else if (cursor === today) {
        // Today grace: an unchecked scheduled today doesn't break the (possibly-best) run.
      } else {
        run = 0;
      }
    }
    cursor = plusDays(cursor, 1);
  }
  return best;
}

function bestWeeklyStreak(
  checkinDays: readonly DayString[],
  target: number,
  today: DayString,
): number {
  const currentKey = isoWeekKey(today);
  const perWeek = new Map<string, number>();
  for (const day of checkinDays) {
    if (day > today) continue;
    const key = isoWeekKey(day);
    perWeek.set(key, (perWeek.get(key) ?? 0) + 1);
  }
  if (perWeek.size === 0) return 0;

  // Walk contiguous weeks from the earliest checked week up to the current week, in order.
  const earliestDay = checkinDays.reduce(
    (min, d) => (d < min ? d : min),
    today,
  );
  let best = 0;
  let run = 0;
  let cursor = earliestDay;
  for (let i = 0; i < MAX_SPAN_DAYS / 7 + 2; i++) {
    const key = isoWeekKey(cursor);
    const met = (perWeek.get(key) ?? 0) >= target;
    if (met) {
      run++;
      if (run > best) best = run;
    } else if (key === currentKey) {
      // Current-week grace: an unmet current week doesn't break the run.
    } else {
      run = 0;
    }
    if (key === currentKey) break;
    cursor = plusDays(cursor, 7);
  }
  return best;
}

/** The state of a single day in a habit's heatmap calendar. */
export type HeatmapState = "done" | "missed" | "unscheduled";

export interface HeatmapBucket {
  day: DayString;
  state: HeatmapState;
}

/**
 * One bucket per day in the inclusive range, chronological. `done` = a check-in exists (even
 * on an unscheduled day — a backfilled extra still shows as done); `missed` = scheduled but
 * unchecked; `unscheduled` = not scheduled and not checked.
 */
export function heatmapBuckets(
  checkinDays: readonly DayString[],
  cadence: Cadence,
  from: DayString,
  to: DayString,
): HeatmapBucket[] {
  const checked = new Set(checkinDays);
  return daysInRange(from, to).map((day) => {
    let state: HeatmapState;
    if (checked.has(day)) state = "done";
    else if (isScheduledOn(cadence, day)) state = "missed";
    else state = "unscheduled";
    return { day, state };
  });
}
