# Phase 5 Handoff — Today screen (the core loop)

**Status:** ✅ complete · **Date:** 2026-07-23
**Verified by:** `tsc --noEmit` clean · `expo lint` clean (exit 0) · `expo-doctor` 20/20 ·
**on-device (Android emulator Pixel_10, Expo Go):** the full < 5-second check-in loop
exercised live on a day that already had 3 seeded habits (Meditate — daily; Drink water —
daily; Dance lessons — weekly_count). Toggling **Meditate** morphed its `CheckControl`
(outlined rounded-square → filled purple circle with a drawn check), fired the haptic, and the
header **ProgressRing updated reactively** (0/3 → 1/3, arc grew) with a "🔥 1" streak label
appearing on the card. Checking the remaining two reached **3/3 → the ring filled + "All done!"
headline + celebrate haptic**. Streak **units are correct**: daily habits show "🔥 1", the
weekly_count habit shows "🔥 1 wk". Tapping a **card body** pushed the `habit/[id]` detail (the
two-target rule). Then created a **Weekdays** habit "Yoga" (Mon/Tue/Wed/**not** Thu/Fri) via the
Phase-4 add flow → on **Thursday** it is correctly **absent** from Today (and not counted in the
3/3) while present in the Habits list as "Mon, Tue, Wed, Fri". No red-box; no real
`ReactNativeJS` errors in logcat. *(iOS unverified — no macOS host.)*

## What this phase delivered
Maps to [build-plan.md](../build-plan.md) §Phase 5 tasks:

- **`useTodayHabits(today)`** (new `src/data/today.ts`) — composes `useHabits` (active, sorted)
  × `isScheduledOn(cadenceOf(h), today)` × today's check-ins, and returns
  `{ items: { habit, cadence, checked, streak, streakUnit }[], done, total, ready, noHabits }`.
  The per-habit **streak is computed here** (memoized over the DB snapshots + `today`), not in
  the card — §9 wants it off the render path, and it needs each habit's full history.
- **`useAllCheckins()`** (added to `src/data/checkins.ts`) — one live subscription over all
  check-ins; `useTodayHabits` groups it by `habitId` so streaks come from a single query rather
  than one live query per card (hooks can't be called in a loop).
- **`CheckControl`** (`src/ui/habit/`, 🟢) — the signature control. One `progress` shared value
  drives a `radius.md`↔circle morph + transparent↔accent fill + accent outline↔none + a
  `scale.pop` overshoot on `springs.bouncy`, and an animated **SVG stroke-draw check** (a
  `react-native-svg` `Path` with `strokeDashoffset` len→0). Reduced motion → `timings.fast`
  cross-fade, no pop, check offset set directly. `haptic.check`/`haptic.uncheck` fired on the
  transition; `role="checkbox"` + `accessibilityState={{ checked }}` + habit-name label.
- **`ProgressRing`** (`src/ui/primitives/`, 🟢) — an SVG track circle + progress circle whose
  `strokeDashoffset` animates on `springs.default`; a once-per-rising-edge `scale.pop` +
  `haptic.celebrate` at 100%; reduced motion snaps. Optional center `label` slot;
  `role="progressbar"` with `accessibilityValue`.
- **`HabitCard`** (`src/ui/habit/`, 🟢) — accent-tinted card, icon chip, `title.medium` name,
  `label.medium` streak ("🔥 5" days / "🔥 3 wk" weeks; hidden at 0), trailing `CheckControl`.
  **Two distinct ≥48dp targets**: the body `Pressable` → `onOpen` (detail); the sibling
  `CheckControl` → `onToggle`.
- **`CompletionSummary`** (`src/ui/habit/`, 🟢) — `ProgressRing` (with a done/total center label)
  + `title.large` date + count; the count line becomes a `headline.large` "All done!" when
  `done === total && total > 0`.
- **Today screen wired** (`src/app/(tabs)/index.tsx`) — thin route: `todayString()` at the
  boundary, `useTodayHabits`, an `Animated.FlatList` of cards with `ListHeaderComponent =
  CompletionSummary` and a `FadeInDown.delay(min(i*stagger.item, stagger.max))` entrance (0 delay
  under reduced motion). Three states: no habits at all → the Phase-3 "add your first habit"
  empty state; habits exist but none scheduled today → a "Nothing due today" empty state under
  the summary; otherwise the summary + cards. Toggling routes through `toggleCheckin(id, today)`
  (today-only, §7.4); the live query re-derives completion + streaks.
- **`todayString()` + `formatDayLong()`** (new `src/lib/date.ts`) — the single data-boundary
  `new Date()` for "today" (as `yyyy-MM-dd`) + a display date formatter. The domain still never
  reads the clock.
- **Strings** — a `today` feature section extended in `src/lib/strings.ts` (count, all-done,
  none-scheduled, streak-label formatters for days vs weeks, a11y labels). No inline copy.

## Key files added/changed
- `src/data/today.ts` — **new**: `useTodayHabits` + `TodayHabit`/`StreakUnit` types.
- `src/data/checkins.ts` — added `useAllCheckins`.
- `src/ui/habit/CheckControl.tsx` — **new** (SVG stroke-draw morph control).
- `src/ui/primitives/ProgressRing.tsx` — **new** (SVG progress ring); added to primitives barrel.
- `src/ui/habit/HabitCard.tsx` — **new** (Today list item, two targets).
- `src/ui/habit/CompletionSummary.tsx` — **new** (Today header).
- `src/ui/habit/index.ts` — export HabitCard / CheckControl / CompletionSummary.
- `src/lib/date.ts` — **new**: `todayString`/`formatDayLong`; exported from `src/lib`.
- `src/lib/strings.ts` — extended the `today` section.
- `src/app/(tabs)/index.tsx` — rewritten from the empty shell to the real Today screen.
- `package.json` / `bun.lock` — added `react-native-svg@15.15.4`.
- `docs/library-docs.md` §1 + **new §11** — react-native-svg entry + verified API/usage.
- `docs/ui-registry.md` — CheckControl / ProgressRing / HabitCard / CompletionSummary specs
  updated to the SVG decision and flipped 🟢.

## Decisions made (and why)
- **`react-native-svg@15.15.4` added** (via `bunx expo install`) and used for **true SVG
  stroke-draws** — the `CheckControl` check (`Path` `strokeDashoffset` len→0) and the
  `ProgressRing` (`Circle` `strokeDashoffset`). Chosen **with the user** over an SVG-free
  View-clip arc / icon cross-fade, for the more Expressive result. API verified from the
  installed source before wiring (`Svg`/`Circle`/`Path` from `./elements`; `CommonPathProps`
  has `strokeDasharray`/`strokeDashoffset`/`strokeLinecap`; reanimated 4.5 `useAnimatedProps`
  present). Recorded in [library-docs.md](../library-docs.md) §11.
- **`useTodayHabits` lives in a new `src/data/today.ts`** (not bolted onto `habits.ts`) — it's a
  distinct composition; keeps `habits.ts` focused. **Streak computed in the hook** (memoized),
  not per-card (§9 perf; needs full history → one `useAllCheckins` subscription, grouped, rather
  than N per-card live queries).
- **"today" via a shared `todayString()` in `src/lib/date.ts`** so the screen, the hook, and
  every `computeStreak` agree on one day. `new Date()` is allowed at this data boundary, never in
  `src/domain` (architecture §2/§7). **Week-start (Phase 7) is NOT wired here** — streaks are
  ISO-week / display-agnostic (§7.3).
- **CheckControl fires the haptic in `onPressIn`** (not through `Pressable`'s `haptic` prop) so
  it can pick `check` vs `uncheck` from the *resulting* state; `scaleOnPress={false}` because the
  morph is the press feedback. The interpolated fill uses reanimated's documented `'transparent'`
  handling (verified in source: `'transparent'` → adjacent color at alpha 0).
- **Card = an accent-tinted `Pressable` + a sibling `CheckControl`** (two non-overlapping hit
  areas), not a single tap surface — satisfies ui-rules §7. Per-habit color is applied as raw
  `style` values from `useHabitColors` (className color would use global M3 roles, which can't
  express a per-habit tint — ui-tokens §1.3).

## Gotchas / things the next agent must know
- **`react-native-svg` is in Expo Go SDK 57's bundled module set**, so no dev build was needed —
  but after installing it, **Metro was restarted with `--clear`** so the new module landed in the
  bundle. If you add a native module Expo Go doesn't bundle, you'd need a dev client.
- **`interpolateColor(..., ['transparent', accent])`** is intentional and safe in reanimated 4.5
  (it maps `'transparent'` to `accent` at alpha 0). Don't "fix" it to an rgba literal.
- **Streak unit label:** daily/weekdays → "🔥 N" (days); weekly_count → "🔥 N wk" (weeks). Driven
  by `TodayHabit.streakUnit` from the hook (the Phase-2 "unit = weeks for weekly_count" rule).
  Streak label is **hidden at 0** (so a fresh/today-grace habit isn't a scary "🔥 0").
- **The emulator's on-screen IME is disruptive to `adb input`** (worse than the Phase-4 stylus
  promo): focusing the add-habit name field repeatedly rendered an all-black screencap (the IME
  layer isn't captured) and sometimes bounced Expo Go to the launcher. Reliable recipe that
  worked: cold-launch the app, `adb shell input tap <field>`, **immediately** `adb shell input
  text "<ascii-no-spaces>"`, then `adb shell input keyevent 111` (ESC) to close the keyboard —
  do **not** send ESC before focus is established, and avoid `%`/spaces in the typed text.
- **A benign dev toast** (a yellow "!" bar with no message) can appear over the tab bar after a
  create; it's an Expo Go dev notice, not our code (no `ReactNativeJS` error logged). Dismiss with
  its ✕.
- **`useTodayHabits.ready` is always `true`** — `useLiveQuery.data` is `[]` before the first
  snapshot, so we render the empty/none-scheduled state rather than a spinner; the `MigrationGate`
  already guarantees the DB is up. `noHabits` (no active habits at all) is the flag that
  distinguishes onboarding from "nothing due today".

## What is NOT done yet (deferred)
- **iOS not verified** — Android emulator only (no macOS host). Re-check the SVG stroke-draw,
  the ring, and reduced-motion feel on iOS when a Mac is available.
- **Habit detail is still the Phase-3 skeleton** — the card body correctly pushes `habit/[id]`,
  but the detail screen (streak hero, heatmap, backfill, stats) is **Phase 6**.
- **Reduced-motion path not visually eyeballed on-device** — the code branches on `useMotion()`
  (verified by reading `useReducedMotion`), but a live "Reduce Motion on" screenshot wasn't taken.
- **No integration test for `useTodayHabits`** — correctness rests on the domain unit tests
  (`isScheduledOn` ×7, `computeStreak` ×16) it composes + the on-device pass; a temp-sqlite
  integration test remains the reasonable add flagged since Phase 2.
- **Weekdays-exclusion proven for the "not today" case** (Yoga excluded on Thursday). The
  scheduled-and-shown case for a weekdays habit on its own weekday wasn't separately captured, but
  it's the same `isScheduledOn` branch (daily/weekly habits shown today already exercise the
  "included" path).

## Next phase
- **Phase 6 — Habit detail & history** ([build-plan.md](../build-plan.md) §Phase 6): make the
  `habit/[id]` screen real. First tasks: `StreakBadge` (current + best via `computeStreak` /
  `bestStreak`), the `Heatmap` calendar (done/scheduled intensity, missed = subtle
  `errorContainer`) with **past-day backfill** via `toggleCheckin` (never future — §7.4),
  completion rate + counts from `stats.ts` (memoized per §9), and edit/archive/delete entry
  points. The stats domain functions + `useHabitCheckins` reader already exist from Phase 2.
