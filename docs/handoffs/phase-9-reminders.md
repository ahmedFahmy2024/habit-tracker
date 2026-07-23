# Phase 9 Handoff — Local reminders (notifications)

**Status:** ✅ complete · **Date:** 2026-07-23
**Verified by:** `tsc --noEmit` clean · `expo lint` **0 warnings** · `expo-doctor` **20/20** ·
domain suite **35/35 green** (reminders never touch the domain) · **on-device (Android emulator
Pixel_10, Expo Go):** app boots with **no red-box**, the full reminder UI renders (habit-form
toggle + time, Settings Reminders section), and reminders degrade **gracefully to a clear
"Unavailable in Expo Go" state** — screenshots exercised (Today · Settings→Reminders · new-habit
form → toggle on → time "8:00 PM"). *(iOS unverified — no macOS host. **Actual OS
firing/cancel/reschedule needs a dev build** — see Gotchas.)*

## What this phase delivered
Maps to [build-plan.md](../build-plan.md) §Phase 9. Opt-in **local** reminder that nudges the user
on a habit's scheduled days while it's still unchecked — no push server, no account, airplane-mode
safe (project-overview §3a).

- **`expo-notifications@57.0.7` + `@react-native-community/datetimepicker@9.1.0`** installed;
  `expo-notifications` config-plugin entry (Android tint `#386a20`) added to `app.json`. The
  `reminders` Android channel is created at **runtime** (`setNotificationChannelAsync`).
- **`src/lib/notifications.ts` wrapper** — the ONE place `expo-notifications` is touched (mirrors
  `haptics.ts`): `ensurePermission` / `getPermissionState` / `scheduleHabitReminder` /
  `cancelHabitReminder` / `rescheduleAll` / `scheduleTestReminder` / `remindersAvailable` /
  `reminderWeekdays`. One **WEEKLY** notification per scheduled weekday (see Decisions).
- **Schema + migration `0002`** — flat `reminderEnabled` (bool, default false) + `reminderTime`
  (minutes-past-midnight int, nullable) on `habits`. Reminders **read** cadence but **never** feed
  streaks (streaks stay purely check-in-derived).
- **Habit form (`HabitForm`)** — a `Toggle` ("Remind me") + a `TimePickerField` (native time
  picker); enabling defaults the time to the Settings default. `createHabit`/`updateHabit` persist
  the fields and call `syncReminder` to schedule/cancel on save.
- **Settings Reminders section (`ReminderSettings`)** — master enable switch, default time,
  notification-permission state with a **request** / **open OS settings** action, and a **test
  reminder**. Denied **and** OS-off/Expo-Go states are surfaced (no silent failure).
- **Reschedule triggers** — create/edit/archive/delete + cadence-change (via the writers), **import**
  (`backup.ts` → `reconcileReminders`), and **app foreground** (`ReminderSync` + `AppState`). Every
  path cancels this habit's ids (or all) first ⇒ **no duplicates**.
- **Graceful Expo-Go degradation** — both native modules are lazy-loaded behind an
  `isRunningInExpoGo()` guard, so the whole app runs in Expo Go with reminders inert + a clear
  unavailable state (rather than red-boxing at import). New `Toggle` + `TimePickerField` primitives.

## Key files added/changed
- `src/lib/notifications.ts` — **new** wrapper (lazy `getNotifications()`, WEEKLY scheduling,
  cancel/reschedule, test reminder).
- `src/lib/time.ts` — **new** minutes-past-midnight ↔ `Date` + `formatReminderTime` + defaults.
- `src/db/schema.ts` — `reminderEnabled` + `reminderTime` columns on `habits`.
- `src/db/migrations/0002_bumpy_korath.sql` (+ regenerated `migrations.js`) — additive ALTER TABLE.
- `src/data/habits.ts` — reminder fields on Create/Update inputs; `reminderHabitOf` mapper;
  `syncReminder` (per-habit, master-switch-gated) + `reconcileReminders` (bulk); archive/delete cancel.
- `src/data/backup.ts` — reminder columns in validate/insert; `reconcileReminders()` after import.
- `src/data/ReminderSync.tsx` — **new** null-render sync (boot + foreground reschedule).
- `src/store/preferences.ts` — `reminderMasterEnabled` + `reminderDefaultTime` prefs.
- `src/store/reminders.ts` — **new** non-hook `remindersEnabled()` accessor for the data layer.
- `src/ui/primitives/Toggle.tsx` · `TimePickerField.tsx` — **new** primitives (+ barrel).
- `src/ui/settings/ReminderSettings.tsx` — **new** Settings section (+ barrel).
- `src/ui/habit/HabitForm.tsx` — reminder toggle + time + permission/unavailable note.
- `src/app/habit/edit/[id].tsx` — pass reminder fields into the form.
- `src/app/_layout.tsx` — mount `<ReminderSync />` inside the MigrationGate.
- `src/lib/strings.ts` — `reminders.*` copy. `app.json` — expo-notifications + datetimepicker plugins.

## Decisions made (and why)
- **⚠️ Trigger = WEEKLY, not CALENDAR** (deviation from the docs). The installed Android source
  (`NotificationScheduler.kt::triggerFromParams`) **throws** `"Trigger of type: calendar is not
  supported on Android"` — CALENDAR is `@platform ios`. WEEKLY is the cross-platform repeating-weekday
  trigger; Android maps it via `Calendar.DAY_OF_WEEK` (**1=Sun…7=Sat**), so domain Weekday 0..6 →
  `weekday + 1`. One WEEKLY notification per scheduled weekday. **library-docs §13 corrected**, and a
  Decisions-log entry recorded. This is exactly the "verify the docs' weekday claim against source"
  the task called out.
- **⚠️ Lazy-load behind an Expo-Go guard.** expo-notifications (`TokenEmitter` → `warnOfExpoGoPushUsage()`
  at module scope) **and** datetimepicker (`TurboModuleRegistry.getEnforcing`) throw at *import time* in
  Expo Go (SDK 53+). A plain top-level import red-boxed the whole app (seen live). Both are now
  `require()`-loaded behind `isRunningInExpoGo()`, so every function no-ops in Expo Go and the UI shows
  "Unavailable in Expo Go". library-docs §13's "works in Expo Go" note corrected.
- **weekly_count reminder fires every day** (chosen with the user): a flexible N-per-week habit has no
  fixed weekdays, so all 7 days at the chosen time; the nudge only matters while today is unchecked.
- **Time picker = `@react-native-community/datetimepicker`** (chosen with the user) — the canonical
  SDK-57 native picker, over a hand-built stepper.
- **Reminder time = minutes-past-midnight** (flat int, nullable; architecture §4) — timezone-agnostic,
  consistent with the rest of the day math. Default **8:00 PM**; a **master switch** globally gates
  scheduling without wiping per-habit toggles.
- **Reminders ≠ streaks** — `reminderWeekdays` reads cadence to pick fire-days, but nothing in the
  notifications path writes the DB or feeds `computeStreak`/`isScheduledOn` (35 domain tests unchanged).
- **Single reschedule entry point** — `reconcileReminders()` (data layer, master-switch-gated) wraps
  `rescheduleAll` (cancel-all-then-schedule). `ReminderSync`/`ReminderSettings` live **outside**
  `src/app/` so Expo Router doesn't treat them as routes.

## Gotchas / things the next agent must know
- **Reminders cannot be exercised in Expo Go — use a dev build.** expo-notifications + datetimepicker
  are absent from the Expo Go binary (SDK 53+). In Expo Go every reminder function is a no-op and the UI
  says so. To verify actual **firing / cancel / reschedule / no-duplicates / denied-permission**, build a
  **dev client** (`expo run:android` or an EAS dev build) — then send a `scheduleTestReminder(10)` from
  Settings → "Send a test reminder" and confirm the OS notification arrives in ~10s.
- **Weekday indexing is `weekday + 1`** (domain 0=Sun..6=Sat → trigger 1=Sun..7=Sat). Do not change to
  0-based — the Android native `Calendar.DAY_OF_WEEK` is 1-based.
- **Android channel is runtime-created**, not by the config plugin. `ensureChannel()` (called from
  `ensurePermission`) creates `reminders`; the plugin only sets the notification tint.
- **`migrations.js` was auto-regenerated** by `drizzle-kit generate` (m0002 added). Never hand-edit it.
- **`predictiveBackGestureEnabled: false`** is already set in `app.json` (Phase 8) — unrelated but keep it.

## What is NOT done yet (deferred)
- **Live OS firing/cancel/reschedule verification** — needs a dev build (see Gotchas). The scheduling
  logic is source-verified and the full UI is live-verified in Expo Go, but no notification has actually
  *fired* on-device in this environment.
- **iOS unverified** — Android emulator only (no macOS host). Re-check the picker (inline iOS spinner),
  the permission prompt, and delivery on iOS when a Mac is available.
- **No jest coverage for `reminderWeekdays` / time helpers** — the jest config only globs `src/domain`,
  and these libs import `expo`/`date-fns`. A future lib-test project could cover them; correctness rests
  on source verification + the live UI check for now.

## Next phase
- **Phase 10 — Home-screen widget (live)** ([build-plan.md](../build-plan.md) §Phase 10). A native
  target (iOS WidgetKit / Android Glance) showing today's completion ring + top streak from shared local
  data. **Cannot run in Expo Go — needs a dev/EAS build** (same constraint hit here). First tasks: pin
  the widget config-plugin/native-target approach and record the verified setup in
  [library-docs.md](../library-docs.md) §14; write the shared today-summary snapshot + `src/lib/widget.ts`.
  A dev build is now doubly warranted (Phase 9's reminders also need one to verify firing).
