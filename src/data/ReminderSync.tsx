/**
 * ReminderSync — keeps scheduled OS reminders reconciled with the DB (build-plan Phase 9).
 *
 * Reschedules on:
 *   • first mount (boot) — catches reminders that should exist after a fresh launch, and heals any
 *     drift (e.g. the OS dropped a scheduled notification, or the day/cadence changed while closed),
 *   • every app foreground (`AppState` → 'active') — the spec's explicit trigger; the user may have
 *     toggled the OS permission or changed the date since backgrounding.
 *
 * `reconcileReminders` cancels-all-then-reschedules and gates on the master switch, so this can
 * fire freely without creating duplicates. Renders nothing. Lives in `src/data` (not `src/app`, so
 * Expo Router doesn't treat it as a route) and is mounted inside the MigrationGate so the habits
 * table it reads is guaranteed to exist. A null-render sync sibling of `ThemeSync`.
 */
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { reconcileReminders } from "./habits";

export function ReminderSync() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Reconcile once on boot.
    void reconcileReminders();

    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      const cameToForeground =
        appState.current.match(/inactive|background/) && next === "active";
      appState.current = next;
      if (cameToForeground) void reconcileReminders();
    });
    return () => sub.remove();
  }, []);

  return null;
}
