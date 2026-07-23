/**
 * Date boundary helpers — the ONE place `new Date()` is read for "today".
 *
 * "Today" is the user's local calendar day as a 'YYYY-MM-DD' string (docs/architecture.md
 * §7.1). Domain code must NEVER call `new Date()` (§2/§7 — time is an input); it receives a
 * `today` string. This helper computes that string at the data/screen boundary so the Today
 * screen, `useTodayHabits`, and every `computeStreak` call agree on the same day.
 *
 * Note: this is display/scheduling-agnostic — it has nothing to do with the (Phase-7)
 * week-start preference, which affects only weekday-chip display, never day math or streaks.
 */
import { format } from "date-fns/format";
import { parseISO } from "date-fns/parseISO";

import { toDayString, type DayString } from "@/domain";

/** The current local calendar day as 'YYYY-MM-DD'. Call at a hook/screen boundary only. */
export function todayString(): DayString {
  return toDayString(new Date());
}

/** A human header label for a day string, e.g. "Thursday, Jul 23". Display-only. */
export function formatDayLong(day: DayString): string {
  return format(parseISO(day), "EEEE, MMM d");
}
