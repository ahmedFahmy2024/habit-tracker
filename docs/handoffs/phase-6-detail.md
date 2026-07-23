# Phase 6 Handoff — Habit detail & history (trustworthy stats)

**Status:** ✅ complete · **Date:** 2026-07-23
**Verified by:** `tsc --noEmit` clean · `expo lint` clean (exit 0) · `expo-doctor` 20/20 ·
a throwaway domain script confirming the exact stat pipeline against hand-computed values (4
cadence cases, all exact) · **on-device (Android emulator Pixel_10, Expo Go):** created a
**daily** habit "Meditate" (purple / meditation icon) and opened its **detail** from the Today
card. The detail rendered the **StreakBadge** ("No streak yet" + "Best: 0 days"), the **3-stat
row** (0d Best · 0% Completion · 0 Check-ins), and the **26-week Heatmap** (every past scheduled
day the subtle `errorContainer` "missed" tint, window "Fri Jan 23 – Thu Jul 23"). **Backfilled a
past day** → its cell turned the habit **accent (done)** and Best 0→1, Completion 0→1%, Check-ins
0→1 updated **reactively**. **Checked today** → the hero became **"🔥 1 / day streak"** (current
streak, accent-tinted) and Check-ins→2; **un-checking reversed** it (streak→0, count→1). Every tap
only ever affected past/today cells (the window ends at today; future cells are non-`Pressable`).
**Edit** opened the pre-populated edit form; **Delete** showed the destructive confirm → hard
delete returned to an empty Today (habit + its check-ins gone via the FK cascade). No red-box; no
real `ReactNativeJS` errors in logcat. *(iOS unverified — no macOS host.)*

## What this phase delivered
Maps to [build-plan.md](../build-plan.md) §Phase 6 tasks:

- **`useHabitStats(id, today)`** (new `src/data/habitStats.ts`) — the composition that drives the
  detail screen. Wraps `useHabit` + `useHabitCheckins` and derives **everything** from the pure
  domain in ONE `useMemo`: `computeStreak` (current), `bestStreak` (best), `completionRate` (over
  the visible window), `heatmapBuckets`, and the all-time check-in count. Memo key is
  `(habitAt, checkinsAt, today, id)` — §9's `(habitId, today, checkinsVersion)` (the live-query
  `updatedAt`s are the version markers; verified they change in lockstep with `data`). Streaks/
  stats are NEVER stored — recomputed so they can't drift (§2). Mirrors `useTodayHabits`.
- **`StreakBadge`** (`src/ui/habit/`, 🟢) — the hero. Presentation-only (takes computed numbers).
  Current streak in `display.medium` **emphasized**, tinted with the habit **accent**
  (`useHabitColors(colorKey).accent`), over a `label.large` unit caption ("day/week streak") and a
  `label.medium` "Best: N" line. Live streak shows a leading 🔥; a **zero** streak reads a quiet
  `headline.medium` "No streak yet" (no scary "🔥 0", matching the Today-card rule). One a11y label
  on the group; decorative emoji hidden.
- **`Heatmap`** (`src/ui/habit/`, 🟢) — a **pure View/flex grid** (not SVG — decided with the
  user) of Sunday-first week columns, newest on the right, in a horizontal `ScrollView` scrolled
  to the end on mount. Each **past/today** cell is its own `Pressable` (→ `onToggleDay(day)` +
  check/uncheck haptic, `hitSlop` to the 48dp min); **future** cells are plain non-interactive
  `View`s. Cell fill = state, tokens/roles only ([ui-tokens.md](../ui-tokens.md) §9): `done` = habit
  `accent`, `missed` = subtle `errorContainer`, `unscheduled` = `surfaceContainerHighest`,
  future/out-of-range = `surfaceContainerLow`. Window = the last **26 weeks** (`heatmap.weeks`);
  backfill is limited to that window. A left weekday-initial legend (alternating rows) orients it.
- **`habit/[id].tsx` wired** (`src/app/habit/`) — rewritten from the Phase-3 skeleton to a **thin**
  route: `todayString()` at the boundary → `useHabitStats(id, today)`; composes `StreakBadge` +
  the 3-stat row (`Best · Completion · Check-ins`, each a small `Surface`+`Text` tile) + `Heatmap`
  + the manage actions. Handles the live-query **loading gap** (blank under the header until the
  habit query resolves) and a genuine **not-found** (`EmptyState`, §8), same pattern as
  `habit/edit/[id]`. Sets the stack header title to the habit name (`<Stack.Screen options>`).
  Backfill routes through `toggleCheckin(id, day)` with a defensive `day > today` guard (§7.4).
- **Manage actions** — **Edit** (`tonal`, → `habit/edit/[id]`), **Archive** (`outlined`,
  `archiveHabit`, confirm `Alert`), **Delete** (`text`, the new `deleteHabit`, destructive confirm
  `Alert`). All three exercised on-device.
- **`deleteHabit(id)`** (new writer in `src/data/habits.ts`) — **hard delete**. Relies on the
  `checkins.habitId` FK `onDelete: 'cascade'` to remove the habit's check-ins with it.
- **`PRAGMA foreign_keys = ON`** added to `src/db/client.ts` — SQLite defaults FK enforcement OFF
  per connection (a compile-time default expo-sqlite doesn't override); without it the cascade
  above would orphan check-ins. Set once, synchronously, on the singleton connection.
- **`formatDayShort(day)`** (`src/lib/date.ts`) — a compact "MMM d" label for heatmap-cell a11y.
- **Tokens & strings** — a `heatmap.*` geometry token block (`tokens.ts` + [ui-tokens.md](../ui-tokens.md)
  §9); the `habitDetail` strings section fully fleshed out (stat labels, streak captions, delete/
  archive confirms, heatmap a11y). No inline copy.

## Key files added/changed
- `src/data/habitStats.ts` — **new**: `useHabitStats` + `HabitStats`/`StreakUnit` types.
- `src/data/habits.ts` — added `deleteHabit` (hard delete, FK cascade).
- `src/db/client.ts` — `PRAGMA foreign_keys = ON` on the connection.
- `src/ui/habit/StreakBadge.tsx` — **new** (hero streak badge).
- `src/ui/habit/Heatmap.tsx` — **new** (View-grid calendar; past-day backfill, future inert).
- `src/ui/habit/index.ts` — export `StreakBadge` / `Heatmap`.
- `src/app/habit/[id].tsx` — rewritten from skeleton to the real thin detail route.
- `src/lib/date.ts` + `src/lib/index.ts` — `formatDayShort`.
- `src/lib/strings.ts` — fleshed-out `habitDetail` section.
- `src/theme/tokens.ts` — `heatmap` geometry tokens.
- `docs/ui-tokens.md` §9 (heatmap geometry + cell-state color table) · `docs/ui-registry.md`
  (StreakBadge / Heatmap specs finalized + flipped 🟢).

## Decisions made (and why) — all four confirmed with the user
- **Hard delete on the detail screen** (new `deleteHabit` + destructive confirm), alongside Edit +
  Archive — gives a real "remove for good" path (the Phase-4 handoff flagged this as the Phase-6
  call). Archive stays as the soft-hide. Delete relies on the FK cascade (+ the new `foreign_keys`
  pragma) so check-ins go with the habit.
- **Heatmap = a pure View/flex grid, last 26 weeks, horizontally scrollable** (not SVG). A
  View-per-cell `Pressable` makes tap→`day` mapping trivial and gives each cell a real 48dp
  hit area, which SVG hit-testing would complicate. Backfill limited to the visible window.
- **Stats computed in a `useHabitStats(id, today)` data hook**, not in the screen — keeps the
  route thin (architecture §3), reuses the `useTodayHabits` memo pattern, and is §9-compliant.
  Memo key `(habitAt, checkinsAt, today, id)`.
- **Detail header = StreakBadge hero + a 3-stat row** (Best · Completion % · total Check-ins).
  Current streak is the `display.medium`-emphasized accent-tinted hero; the three tiles are
  `title.large` values over `label.medium` labels. Completion % is over the visible 26-week window
  (so the header number and the heatmap agree).

## Gotchas / things the next agent must know
- **`foreign_keys` was OFF before this phase.** The Phase-2 schema declared the cascade FK but the
  connection never enabled enforcement, so any prior "delete" would have orphaned rows. It's ON now
  (`client.ts`); keep it. If you add more FKs, they now actually enforce.
- **`useHabitStats` memo keys on the live-query `updatedAt`, not the `data` array.** `updatedAt`
  changes exactly when `data` does (verified in drizzle's `useLiveQuery` source), and the array ref
  is stable within a snapshot — so keying on `updatedAt` avoids recomputing on unrelated re-renders
  while staying correct. The one `eslint-disable react-hooks/exhaustive-deps` in the file is
  deliberate and documented there.
- **`useHabitCheckins(id)`'s change listener fires on ANY `checkins` write** (it filters by table
  name, not `habitId`), so toggling another habit re-runs this query. `data` stays correct (the
  SQL is filtered by `habitId`); it's just an occasional harmless recompute — same trade-off as
  `useTodayHabits`.
- **Heatmap window is fixed at 26 weeks** via `heatmap.weeks`; `from = subtractDays(today, 26*7-1)`.
  Backfill is deliberately limited to this window (there are no cells for older days). If a longer
  history view is wanted later, bump the token — the grid + `completionRate` both follow it.
- **The `Delete` action uses the Button `text` variant** (primary-colored, not error-colored) —
  the Button primitive has no `error` variant, and adding one was out of scope. The destructive
  intent is carried by the trash icon, the bottom (least-prominent) placement, and the
  `style: "destructive"` confirm `Alert`. An error-tinted Button variant is a reasonable Phase-8
  polish item.
- **On-device flakiness was memory, not code.** The Pixel_10 AVD ships with **2 GB** RAM; under
  that, Android's low-memory-killer repeatedly knocked Expo Go back to the launcher and the app
  couldn't stay foregrounded. **Re-launching the emulator with `-memory 3072` fixed it** — the app
  then loaded and drove cleanly. If verification bounces to the launcher again, check
  `adb logcat … "mem-pressure-event"` and boot with more RAM. (Also: `router.back()` from a route
  reached via a fresh `exp://` deep-link **exits Expo Go** because there's no stack under it — enter
  through a tab so there's something to pop back to.)
- **DB was empty at phase start** — the Phase-5 seed habits (Meditate/Drink water/Dance/Yoga) did
  **not** persist into this emulator's Expo Go sandbox (fresh/cleared data), and there's no seed
  script. Stats were verified by creating a habit and backfilling via the very feature under test,
  plus a throwaway domain script (deleted) that ran the exact 4 pure functions over hand-designed
  patterns — all matched (daily 5-run=5; today-grace=4; weekly_count 2 weeks; weekdays skip-Thu=4).

## What is NOT done yet (deferred)
- **iOS not verified** — Android emulator only (no macOS host). Re-check the heatmap grid, the
  accent-tinted hero, reduced-motion, and the destructive confirm on iOS when a Mac is available.
- **Future-day non-interactivity verified structurally, not by a landed tap.** Reliably tapping a
  single 14dp future cell blind via `adb` proved impractical; the guarantee is in the code (future
  cells render as plain `View`s, not `Pressable`, and the route also guards `day > today`) and no
  tap in the whole session ever created a check-in beyond today (the window ends at today).
- **No error-tinted Delete button** — see the gotcha; deferred to Phase 8 polish.
- **No integration test for `useHabitStats`** — correctness rests on the domain unit tests it
  composes (`computeStreak` ×16, `stats` ×12, `cadence` ×7), the throwaway domain script, and the
  on-device pass. A temp-sqlite integration test remains the reasonable add flagged since Phase 2.
- **Reduced-motion / large-history-perf not separately eyeballed** — the detail screen has no
  bespoke animations (it composes memoized derivations + static views); `useHabitStats` is
  O(history) and memoized per §9, but a multi-year-history smoothness check wasn't run on-device.

## Next phase
- **Phase 7 — Settings & data safety** ([build-plan.md](../build-plan.md) §Phase 7): theme mode
  (light/dark/system), accent key, and **week-start** — all zustand-persisted (`src/store/`); JSON
  **export** (to a user-picked file) and **import/restore**; About + version. First tasks: the
  zustand preferences store + wiring it into `useTheme`/the tab display, then the export/import
  round-trip (must be lossless over all habits + check-ins). **Reminder:** week-start is
  display-only — it reorders weekday-chip DISPLAY (CadencePicker) and could reorder the Heatmap's
  weekday legend, but must NEVER touch stored `Weekday` numbers, `isScheduledOn`, or streaks (§7.2/§7.3).
