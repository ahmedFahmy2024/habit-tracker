/** Lib barrel — semantic helpers shared across the app. */
export { haptics, type HapticEvent } from "./haptics";
export { newId } from "./id";
export { logger } from "./logger";
export { strings } from "./strings";
export { cadenceSummary } from "./cadence";
export { todayString, formatDayLong, formatDayShort } from "./date";
export { weekdayDisplayOrder, reorderBySunday } from "./weekOrder";
export {
  ensurePermission,
  getPermissionState,
  scheduleHabitReminder,
  cancelHabitReminder,
  rescheduleAll,
  reminderWeekdays,
  scheduleTestReminder,
  remindersAvailable,
  REMINDERS_CHANNEL_ID,
  type ReminderHabit,
  type PermissionState,
} from "./notifications";
export {
  formatReminderTime,
  reminderTimeToDate,
  dateToReminderTime,
  DEFAULT_REMINDER_TIME,
} from "./time";
export {
  publishTodaySnapshot,
  widgetAvailable,
  TODAY_WIDGET_NAME,
} from "./widget";
