/**
 * WidgetSync — keeps the home-screen widget's snapshot in sync with the live Today data
 * (build-plan Phase 10). A null-render sibling of `ReminderSync`, mounted inside the MigrationGate.
 *
 * It subscribes to the SAME `useTodayHabits` derivation the Today screen uses (so it reuses the
 * existing done/total + `computeStreak` numbers — the widget never re-derives streaks), freezes
 * them into a `WidgetSnapshot`, writes it, and asks the OS to redraw. Because `useTodayHabits` is
 * backed by `useLiveQuery`, this re-runs automatically on **every check-in write** — that IS the
 * "publish from the check-in write path" requirement, done reactively rather than by hand-calling
 * from `toggleCheckin` (which would couple the data layer to the widget lib).
 *
 * Also republishes on **app foreground** (`AppState` → active): the day may have rolled over or the
 * user may have changed the accent while backgrounded, and the widget should reflect that next time
 * it's drawn. `publishTodaySnapshot` is debounced and a no-op off-Android, so this is cheap.
 *
 * Snapshot writes are synchronous + tiny; only the native redraw is debounced (in the wrapper).
 */
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { publishTodaySnapshot, todayString } from "@/lib";
import { usePreferences } from "@/store";

import { computeTodaySnapshot, writeSnapshot } from "./widgetSnapshot";
import { useTodayHabits } from "./today";

export function WidgetSync() {
  const today = todayString();
  const { items, done, total, ready } = useTodayHabits(today);
  const accentKey = usePreferences((s) => s.accentKey);
  const appState = useRef(AppState.currentState);

  // Publish whenever the derived summary or the accent changes (live-query re-runs cover check-ins).
  useEffect(() => {
    if (!ready) return;
    writeSnapshot(computeTodaySnapshot(today, { items, done, total }, accentKey));
    publishTodaySnapshot();
  }, [today, items, done, total, accentKey, ready]);

  // Republish on foreground (catches day rollover / accent change while backgrounded).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      const cameToForeground =
        appState.current.match(/inactive|background/) && next === "active";
      appState.current = next;
      if (cameToForeground) publishTodaySnapshot();
    });
    return () => sub.remove();
  }, []);

  return null;
}
