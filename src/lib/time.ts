/**
 * Time-of-day helpers for reminders (build-plan Phase 9).
 *
 * A reminder time is stored as **minutes past local midnight** (0..1439) — a flat integer
 * column (docs/architecture.md §4), timezone-agnostic like the rest of our day math. These pure
 * helpers convert to/from the shapes the UI needs:
 *   • a `Date` for `@react-native-community/datetimepicker` (it only cares about the h:m fields),
 *   • a display string like "7:30 AM" for the form/settings rows.
 *
 * No `new Date()`-for-"today" here beyond constructing a throwaway carrier for the picker; this
 * has nothing to do with scheduling or streaks (docs/architecture.md §2).
 */
import { format } from "date-fns/format";

/** The default reminder time for a freshly-enabled reminder: 8:00 PM (minutes past midnight). */
export const DEFAULT_REMINDER_TIME = 20 * 60; // 20:00

/** Clamp any number into a valid minutes-past-midnight value (0..1439). */
function clampMinutes(minutes: number): number {
  return Math.max(0, Math.min(1439, Math.round(minutes)));
}

/** Minutes past midnight → a carrier `Date` (today's date, that h:m) for the picker's `value`. */
export function reminderTimeToDate(minutesPastMidnight: number): Date {
  const m = clampMinutes(minutesPastMidnight);
  const d = new Date();
  d.setHours(Math.floor(m / 60), m % 60, 0, 0);
  return d;
}

/** A picker's chosen `Date` → minutes past midnight (only the h:m fields are read). */
export function dateToReminderTime(date: Date): number {
  return clampMinutes(date.getHours() * 60 + date.getMinutes());
}

/** Display a reminder time, e.g. "8:00 PM". Locale-agnostic 12-hour clock (v1 is English). */
export function formatReminderTime(minutesPastMidnight: number): string {
  return format(reminderTimeToDate(minutesPastMidnight), "h:mm a");
}
