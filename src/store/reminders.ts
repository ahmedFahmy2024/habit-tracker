/**
 * Non-hook accessor for the reminders master switch (Phase 9).
 *
 * The data layer's reminder scheduling (`src/data/habits.ts::syncReminder`) runs outside React, so
 * it can't use the `usePreferences` hook. Zustand exposes the current state synchronously via
 * `getState()`, letting the write path read the master switch without a subscription. This keeps
 * the gate in one place: when the master switch is off, NO habit reminder is scheduled, regardless
 * of a habit's own toggle (the habit's stored `reminderEnabled` is preserved for when it's re-on).
 */
import { usePreferences } from "./preferences";

/** Whether reminders are globally allowed (the Settings master switch). Reads state synchronously. */
export function remindersEnabled(): boolean {
  return usePreferences.getState().reminderMasterEnabled;
}
