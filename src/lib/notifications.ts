/**
 * Local reminders wrapper over expo-notifications — docs/build-plan.md §Phase 9,
 * docs/library-docs.md §13. Mirrors the `src/lib/haptics.ts` rule: components/screens NEVER
 * import `expo-notifications` directly; they call these intention-named functions so the
 * scheduling policy lives in exactly one place.
 *
 * These are LOCAL, on-device reminders only: no push token, no `getExpoPushTokenAsync`, no
 * server, no `projectId`. Everything here works in airplane mode (docs/project-overview.md §2).
 *
 * ── Trigger choice (verified from installed source, NOT training recall) ────────────────────
 * docs/library-docs.md §13 sketched a CALENDAR trigger, but reading the *installed*
 * expo-notifications@57.0.7 Android source
 * (`android/.../scheduling/NotificationScheduler.kt::triggerFromParams`) shows CALENDAR throws
 * "Trigger of type: calendar is not supported on Android" — it is `@platform ios` only. The
 * cross-platform repeating-weekday trigger is **WEEKLY** (`SchedulableTriggerInputTypes.WEEKLY`),
 * which the Android native code maps via `Calendar.DAY_OF_WEEK`. Java's `Calendar.DAY_OF_WEEK`
 * is **1 = Sunday … 7 = Saturday** (`Calendar.SUNDAY == 1`), matching the WeeklyTriggerInput
 * .d.ts note. So we schedule one WEEKLY notification per scheduled weekday, converting our
 * domain Weekday (0=Sun..6=Sat) → the trigger's 1..7 with `+1`.
 *
 * ── Reminder ≠ streak (critical) ────────────────────────────────────────────────────────────
 * Reminder scheduling READS a habit's cadence (to choose which weekdays to fire on) but MUST
 * NOT feed back into streaks or scheduling. Streaks stay purely check-in-derived
 * (docs/architecture.md §7.3; same spirit as the display-only week-start rule). Nothing in this
 * file writes to the DB or influences `computeStreak`/`isScheduledOn`.
 *
 * ── Expo Go guard (verified on-device SDK 57) ───────────────────────────────────────────────
 * expo-notifications was **removed from Expo Go in SDK 53+**: on Android its `TokenEmitter`
 * module throws at *import time* in Expo Go (`warnOfExpoGoPushUsage()` at module scope), so a
 * plain `import * as Notifications from "expo-notifications"` red-boxes the whole app in Expo Go.
 * We therefore load the module **lazily** and skip it entirely under Expo Go (`isRunningInExpoGo`):
 * every function becomes a safe no-op there, and the full feature runs in a dev/EAS build. This is
 * why library-docs §13's "works in Expo Go for basic testing" note is corrected — verify reminders
 * in a dev build, not Expo Go.
 */
import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

import type { Cadence, Weekday } from "@/domain";

import { logger } from "./logger";
import { strings } from "./strings";

/** The single Android channel all reminders post to (created lazily on first use). */
export const REMINDERS_CHANNEL_ID = "reminders";

/** Namespaced key placed in each scheduled notification's `data` so we can find/cancel by habit. */
const HABIT_ID_KEY = "habitId";

// The lazily-required expo-notifications module (typed via `import type` so no value import runs at
// load). Cached after the first successful require. `null` = unavailable (Expo Go / require failed).
type NotificationsModule = typeof import("expo-notifications");
let cached: NotificationsModule | null | undefined;
let handlerSet = false;

/**
 * Lazily get the expo-notifications module, or `null` when it isn't usable (Expo Go, where the
 * module throws on import). Sets the foreground-presentation handler once on first successful load.
 * NEVER imports the module at file scope — that would crash Expo Go (see the header note).
 */
function getNotifications(): NotificationsModule | null {
  if (cached !== undefined) return cached;
  if (isRunningInExpoGo()) {
    logger.warn(
      "notifications: expo-notifications is unavailable in Expo Go (SDK 53+). Reminders are inert; use a dev build to test them.",
    );
    cached = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require("expo-notifications") as NotificationsModule;
  } catch (error) {
    logger.error("notifications: failed to load expo-notifications", { error });
    cached = null;
    return null;
  }
  if (!handlerSet) {
    // Foreground presentation: modern `shouldShowBanner`/`shouldShowList` (the old
    // `shouldShowAlert` is deprecated). Must resolve within 3s. Quiet nudge — no sound/badge.
    cached.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    handlerSet = true;
  }
  return cached;
}

/** Whether reminders can run at all on this build (false in Expo Go). */
export function remindersAvailable(): boolean {
  return getNotifications() !== null;
}

/* ------------------------------------------------------------------ permission */

export type PermissionState = "granted" | "denied" | "undetermined" | "unavailable";

/**
 * Ensure the Android reminders channel exists. Idempotent (Android only; a no-op elsewhere).
 * Required both for the permission prompt and for delivery (docs/library-docs.md §13).
 */
async function ensureChannel(): Promise<void> {
  const N = getNotifications();
  if (!N || Platform.OS !== "android") return;
  try {
    await N.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
      name: strings.reminders.channelName,
      importance: N.AndroidImportance.DEFAULT,
      // A reminder is informational — no insistent sound/vibration beyond the default.
      showBadge: false,
    });
  } catch (error) {
    logger.error("notifications: ensureChannel failed", { error });
  }
}

/** The current permission state without prompting the user. `unavailable` in Expo Go. */
export async function getPermissionState(): Promise<PermissionState> {
  const N = getNotifications();
  if (!N) return "unavailable";
  try {
    const { status, canAskAgain } = await N.getPermissionsAsync();
    if (status === "granted") return "granted";
    // `undetermined` (never asked) is distinct from a hard `denied` we can't re-prompt for.
    return status === "undetermined" || canAskAgain ? "undetermined" : "denied";
  } catch (error) {
    logger.error("notifications: getPermissionState failed", { error });
    return "undetermined";
  }
}

/**
 * Ensure we have permission to post reminders, prompting once if it hasn't been decided yet.
 * Also creates the Android channel. Returns whether reminders can actually be delivered so the
 * caller can surface a denied state (no silent failure — build-plan Phase 9 done-when). Returns
 * false in Expo Go (module unavailable).
 */
export async function ensurePermission(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  await ensureChannel();
  try {
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false; // hard-denied — must go to OS settings

    const requested = await N.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: false },
    });
    return requested.granted;
  } catch (error) {
    logger.error("notifications: ensurePermission failed", { error });
    return false;
  }
}

/* ------------------------------------------------------------------ scheduling */

/**
 * The minimal habit shape this module needs. Deliberately NOT the Drizzle row — callers pass a
 * normalized view so the lib doesn't depend on the DB layer (mirrors the domain's decoupling).
 */
export interface ReminderHabit {
  id: string;
  name: string;
  cadence: Cadence;
  /** Whether a reminder is enabled for this habit. */
  reminderEnabled: boolean;
  /** Minutes past local midnight (0..1439), or null when no time is set. */
  reminderTime: number | null;
  /** ISO timestamp when archived, or null. Archived habits never get reminders. */
  archivedAt: string | null;
}

/**
 * The weekdays (domain 0=Sun..6=Sat) a reminder should fire on, derived from cadence:
 *   • weekdays      → exactly the cadence's chosen days,
 *   • daily         → all seven days,
 *   • weekly_count  → all seven days (every day is a valid opportunity — decided with the user;
 *                     the nudge only actually shows while today is still unchecked).
 * This READS the cadence but never influences it or streaks.
 */
export function reminderWeekdays(cadence: Cadence): Weekday[] {
  switch (cadence.type) {
    case "weekdays":
      return [...cadence.weekdays].sort((a, b) => a - b);
    case "daily":
    case "weekly_count":
      return [0, 1, 2, 3, 4, 5, 6];
  }
}

/** Split minutes-past-midnight into { hour, minute }; clamps defensively into range. */
function splitTime(minutesPastMidnight: number): { hour: number; minute: number } {
  const clamped = Math.max(0, Math.min(1439, Math.round(minutesPastMidnight)));
  return { hour: Math.floor(clamped / 60), minute: clamped % 60 };
}

/** Whether this habit is eligible for a reminder (on, active, has a time). */
function shouldSchedule(habit: ReminderHabit): boolean {
  return (
    habit.reminderEnabled &&
    habit.archivedAt === null &&
    habit.reminderTime !== null
  );
}

/**
 * Post one WEEKLY notification per scheduled weekday for an (already-validated) habit. Assumes the
 * caller cleared this habit's ids and holds permission, and passes the loaded module. Returns
 * whether anything was scheduled. The single place the actual `scheduleNotificationAsync` call lives.
 */
async function postReminder(
  N: NotificationsModule,
  habit: ReminderHabit,
): Promise<boolean> {
  const { hour, minute } = splitTime(habit.reminderTime as number);
  const weekdays = reminderWeekdays(habit.cadence);
  if (weekdays.length === 0) return false; // e.g. a weekdays cadence with no days picked

  try {
    await Promise.all(
      weekdays.map((weekday) =>
        N.scheduleNotificationAsync({
          content: {
            title: habit.name,
            body: strings.reminders.body,
            data: { [HABIT_ID_KEY]: habit.id },
          },
          trigger: {
            type: N.SchedulableTriggerInputTypes.WEEKLY,
            // Domain Weekday 0=Sun..6=Sat → trigger 1=Sun..7=Sat (Android Calendar.DAY_OF_WEEK).
            weekday: weekday + 1,
            hour,
            minute,
            channelId: REMINDERS_CHANNEL_ID,
          },
        }),
      ),
    );
    return true;
  } catch (error) {
    logger.error("notifications: postReminder failed", {
      habitId: habit.id,
      error,
    });
    return false;
  }
}

/**
 * Cancel every scheduled reminder belonging to a habit. Safe to call when none exist (or in Expo
 * Go — a no-op). We match on the `data.habitId` we stamped at schedule time (getAll returns all
 * scheduled requests), so a reschedule can always clear this habit's ids first → no duplicates.
 */
export async function cancelHabitReminder(habitId: string): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  try {
    const scheduled = await N.getAllScheduledNotificationsAsync();
    const mine = scheduled.filter(
      (req) => req.content?.data?.[HABIT_ID_KEY] === habitId,
    );
    await Promise.all(
      mine.map((req) => N.cancelScheduledNotificationAsync(req.identifier)),
    );
  } catch (error) {
    logger.error("notifications: cancelHabitReminder failed", { habitId, error });
  }
}

/**
 * (Re)schedule a habit's reminder: cancel its existing ids first (idempotent — no duplicates),
 * then, if the reminder is on and the habit is active with a time set, schedule one WEEKLY
 * notification per scheduled weekday. Requires permission; a denied habit is left cancelled.
 *
 * Returns true if a reminder is now scheduled, false if it was (intentionally) cleared or
 * couldn't be scheduled (no permission / disabled / archived / no time).
 */
export async function scheduleHabitReminder(
  habit: ReminderHabit,
): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false; // Expo Go — inert.
  // Always clear first so repeated saves never stack duplicates.
  await cancelHabitReminder(habit.id);
  if (!shouldSchedule(habit)) return false;

  const granted = await ensurePermission();
  if (!granted) return false;

  return postReminder(N, habit);
}

/**
 * Reconcile ALL habits' reminders against the OS in one pass. Called on app foreground and after
 * a bulk data change (e.g. import). Clears every previously-scheduled reminder, then reschedules
 * the ones that should be on. This is the belt-and-suspenders guard against stale/duplicate ids
 * (build-plan Phase 9: "reschedule on app foreground; cancel this habit's ids first").
 *
 * If no habit has reminders enabled we still cancel all, so a disabled-everything state truly
 * clears the OS. Never throws.
 */
export async function rescheduleAll(habits: ReminderHabit[]): Promise<void> {
  const N = getNotifications();
  if (!N) return; // Expo Go — inert.
  try {
    // Clear the whole slate first — covers deleted/archived habits whose ids we'd otherwise miss.
    await N.cancelAllScheduledNotificationsAsync();

    const active = habits.filter(shouldSchedule);
    if (active.length === 0) return;

    // Ask once up front so N habits don't trigger N prompts.
    const granted = await ensurePermission();
    if (!granted) return;

    // The slate is already cleared above, so post directly (no per-habit re-cancel).
    for (const habit of active) {
      await postReminder(N, habit);
    }
  } catch (error) {
    logger.error("notifications: rescheduleAll failed", { error });
  }
}

/* ------------------------------------------------------------------ dev/testing */

/**
 * Fire a one-shot test reminder after `seconds` (default 10) via a TIME_INTERVAL trigger — used
 * during on-device verification (build-plan Phase 9 done-when) to confirm delivery quickly
 * without waiting for a real weekday/time. Requires permission.
 */
export async function scheduleTestReminder(seconds = 10): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false; // Expo Go — inert.
  const granted = await ensurePermission();
  if (!granted) return false;
  try {
    await N.scheduleNotificationAsync({
      content: {
        title: strings.reminders.testTitle,
        body: strings.reminders.testBody,
        data: { [HABIT_ID_KEY]: "__test__" },
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId: REMINDERS_CHANNEL_ID,
      },
    });
    return true;
  } catch (error) {
    logger.error("notifications: scheduleTestReminder failed", { error });
    return false;
  }
}
