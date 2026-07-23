/**
 * Scheduling — is a habit scheduled on a given day? (docs/architecture.md §7.2)
 *
 * Pure: input = normalized cadence + a day string; output = boolean. Scheduling is NOT the
 * same as the goal being met — for weekly_count every day is an opportunity; whether the
 * weekly target is hit lives in streak.ts.
 */
import { weekdayOf } from "./dateUtil";
import type { Cadence, DayString } from "./types";

export function isScheduledOn(cadence: Cadence, day: DayString): boolean {
  switch (cadence.type) {
    case "daily":
      return true;
    case "weekdays":
      return cadence.weekdays.includes(weekdayOf(day));
    case "weekly_count":
      // Every day is a valid opportunity; the N-per-week goal is a streak concern (§7.3).
      return true;
  }
}
