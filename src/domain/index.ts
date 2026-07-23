/**
 * Domain barrel — pure scheduling/streak/stats logic (docs/architecture.md §7).
 * No React, DB, or expo imports anywhere under src/domain (docs/code-standards.md §5).
 */
export { isScheduledOn } from "./cadence";
export { computeStreak } from "./streak";
export {
  bestStreak,
  completionRate,
  heatmapBuckets,
  type HeatmapBucket,
  type HeatmapState,
} from "./stats";
export {
  isoWeekKey,
  plusDays,
  subtractDays,
  toDayString,
  weekdayOf,
} from "./dateUtil";
export type { Cadence, DayString, Weekday } from "./types";
