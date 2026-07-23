/**
 * Pure day-string helpers for the domain (docs/architecture.md §7.1).
 *
 * Days are 'YYYY-MM-DD' local-calendar strings. We parse them to local midnight for weekday
 * and week math and only ever format back to 'yyyy-MM-dd'. Because arithmetic is done in
 * whole calendar days (never hour math), DST transitions can't shift a day — §7.5.
 *
 * No React / DB / expo imports (docs/code-standards.md §5).
 */
import { addDays } from "date-fns/addDays";
import { format } from "date-fns/format";
import { getDay } from "date-fns/getDay";
import { getISOWeek } from "date-fns/getISOWeek";
import { getISOWeekYear } from "date-fns/getISOWeekYear";
import { parseISO } from "date-fns/parseISO";
import { subDays } from "date-fns/subDays";

import type { DayString, Weekday } from "./types";

/** Parse a 'YYYY-MM-DD' string to a local-midnight Date (used only for calendar math). */
function toDate(day: DayString): Date {
  return parseISO(day);
}

/** Format a Date back to a 'YYYY-MM-DD' day string. */
export function toDayString(date: Date): DayString {
  return format(date, "yyyy-MM-dd");
}

/** The weekday of a day, 0 = Sunday … 6 = Saturday (matches date-fns `getDay`). */
export function weekdayOf(day: DayString): Weekday {
  return getDay(toDate(day)) as Weekday;
}

/** The day `n` calendar days before `day` (n=1 → yesterday). DST-safe (whole-day math). */
export function subtractDays(day: DayString, n: number): DayString {
  return toDayString(subDays(toDate(day), n));
}

/** The day `n` calendar days after `day` (n=1 → tomorrow). DST-safe (whole-day math). */
export function plusDays(day: DayString, n: number): DayString {
  return toDayString(addDays(toDate(day), n));
}

/**
 * A stable ISO-week key ('GGGG-Www', e.g. '2026-W30') for a day. ISO weeks run Mon–Sun and
 * are independent of any display week-start preference (docs/architecture.md §7.3). Two days
 * in the same ISO week share this key; the year is the ISO week-year (so 2023-01-01, a
 * Sunday, keys to '2022-W52').
 */
export function isoWeekKey(day: DayString): string {
  const d = toDate(day);
  const week = getISOWeek(d);
  const year = getISOWeekYear(d);
  return `${year}-W${String(week).padStart(2, "0")}`;
}
