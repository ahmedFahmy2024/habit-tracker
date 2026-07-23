/**
 * Domain types — the plain-data shapes the pure logic operates on (docs/architecture.md §7).
 * These are deliberately decoupled from the Drizzle row types: the domain takes normalized
 * input so it never depends on the DB layer (docs/code-standards.md §5, §7 import direction).
 */

/** A local calendar day, 'YYYY-MM-DD'. Sorts lexicographically == chronologically. */
export type DayString = string;

/** Weekday number, 0 = Sunday … 6 = Saturday (matches date-fns `getDay`). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A habit's cadence, normalized from the flat schema columns into a discriminated union so
 * the domain can't represent an invalid combination (e.g. weekdays without a day list).
 */
export type Cadence =
  | { type: "daily" }
  | { type: "weekdays"; weekdays: readonly Weekday[] }
  | { type: "weekly_count"; weeklyTarget: number };
