/**
 * Streaks — docs/architecture.md §7.3. A streak counts consecutive *scheduled* days (or, for
 * weekly_count, ISO weeks) that were satisfied, walking backward from today.
 *
 * Pure: input = the habit's checked day strings + its cadence + `today`; output = a number.
 * Unit is DAYS for daily/weekdays and WEEKS for weekly_count. No React/DB/expo imports.
 */
import { isScheduledOn } from "./cadence";
import { isoWeekKey, subtractDays } from "./dateUtil";
import type { Cadence, DayString } from "./types";

/** A generous cap on the backward walk so a corrupt input can never loop forever. */
const MAX_LOOKBACK_DAYS = 366 * 20;

export function computeStreak(
  checkinDays: readonly DayString[],
  cadence: Cadence,
  today: DayString,
): number {
  const checked = new Set(checkinDays);
  return cadence.type === "weekly_count"
    ? weeklyStreak(checked, cadence.weeklyTarget, today)
    : dailyStreak(checked, cadence, today);
}

/**
 * daily / weekdays: walk back day by day. Unscheduled days are skipped (they never break the
 * streak). A scheduled day counts if it was checked; the first scheduled-but-unchecked day
 * stops the walk. Today-grace (§7.3): if today is scheduled but not yet checked, it doesn't
 * break the streak — the walk simply starts at yesterday.
 */
function dailyStreak(
  checked: Set<DayString>,
  cadence: Cadence,
  today: DayString,
): number {
  let streak = 0;
  let cursor = today;

  // Today grace: only skip today when it's scheduled AND unchecked. If it's checked it counts
  // normally; if it's unscheduled the loop below would skip it anyway.
  if (isScheduledOn(cadence, today) && !checked.has(today)) {
    cursor = subtractDays(cursor, 1);
  }

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    if (!isScheduledOn(cadence, cursor)) {
      cursor = subtractDays(cursor, 1); // unscheduled → skip, no effect on streak
      continue;
    }
    if (!checked.has(cursor)) break; // scheduled + unsatisfied → streak ends
    streak++;
    cursor = subtractDays(cursor, 1);
  }
  return streak;
}

/**
 * weekly_count: operate on ISO weeks (Mon–Sun, independent of any display week-start). A week
 * is satisfied when its check-in count ≥ target. Walk back week by week from the current
 * week. The current week is grace: it never breaks the streak and is counted only once met.
 */
function weeklyStreak(
  checked: Set<DayString>,
  target: number,
  today: DayString,
): number {
  // Count check-ins per ISO week. Future days (> today) are ignored so a backfilled/erroneous
  // future check-in can't inflate the current week.
  const perWeek = new Map<string, number>();
  for (const day of checked) {
    if (day > today) continue;
    const key = isoWeekKey(day);
    perWeek.set(key, (perWeek.get(key) ?? 0) + 1);
  }

  const met = (key: string) => (perWeek.get(key) ?? 0) >= target;

  let streak = 0;
  let cursor = today;
  const currentKey = isoWeekKey(today);

  // Current-week grace: if this week isn't met yet, don't count it but don't break either —
  // step straight back to the previous week.
  if (!met(currentKey)) {
    cursor = subtractDays(cursor, 7);
  }

  // Walk back a week at a time. Stepping by 7 days always lands in the immediately prior ISO
  // week, so each iteration sees a distinct week key.
  for (let i = 0; i < MAX_LOOKBACK_DAYS / 7; i++) {
    if (!met(isoWeekKey(cursor))) break;
    streak++;
    cursor = subtractDays(cursor, 7);
  }
  return streak;
}
