/**
 * Week-start DISPLAY ordering — pure, display-only (docs/architecture.md §7.2/§7.3).
 *
 * The user's week-start preference (0 = Sunday, 1 = Monday) changes ONLY the order in which
 * weekday cells are laid out on screen (the CadencePicker's weekday chips and the Heatmap's
 * weekday-row legend). It must NEVER affect the stored `Weekday` numbers, `isScheduledOn`,
 * ISO-week math, or streaks — those are all defined against the fixed 0=Sun..6=Sat numbering.
 *
 * These helpers therefore only ever REORDER a fixed 7-element sequence; they never re-number a
 * weekday. Given `weekStart = 1` (Monday), Sunday (0) simply moves to the end of the display
 * order — its number is still 0 everywhere in the domain.
 */
import type { Weekday } from "@/domain";

/** All seven weekday numbers in canonical Sunday-first order (0=Sun..6=Sat). */
const SUNDAY_FIRST: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/**
 * The weekday NUMBERS in display order for the given week-start. A pure rotation of the fixed
 * Sunday-first list — the numbers are unchanged, only their position.
 *
 * @example weekdayDisplayOrder(0) → [0,1,2,3,4,5,6]  (Sun-first)
 * @example weekdayDisplayOrder(1) → [1,2,3,4,5,6,0]  (Mon-first)
 */
export function weekdayDisplayOrder(weekStart: 0 | 1): readonly Weekday[] {
  if (weekStart === 0) return SUNDAY_FIRST;
  return [...SUNDAY_FIRST.slice(weekStart), ...SUNDAY_FIRST.slice(0, weekStart)];
}

/**
 * Reorder any 7-element array that is indexed Sunday-first (index 0 = Sunday's value) into
 * display order for the given week-start. Used to rotate a legend/label array in lockstep with
 * `weekdayDisplayOrder`, so labels stay attached to their weekday. Non-mutating.
 *
 * @example reorderBySunday(['S','M','T','W','T','F','S'], 1) → ['M','T','W','T','F','S','S']
 */
export function reorderBySunday<T>(sundayFirst: readonly T[], weekStart: 0 | 1): T[] {
  if (weekStart === 0) return [...sundayFirst];
  return [...sundayFirst.slice(weekStart), ...sundayFirst.slice(0, weekStart)];
}
