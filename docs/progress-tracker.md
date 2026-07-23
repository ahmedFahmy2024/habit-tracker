# Progress Tracker — Happit

> Living status of the build. Update this as you go. Mirrors the phases in
> [build-plan.md](./build-plan.md). Keep it honest — a box is only checked when its
> "done when" bar is actually met.

**Legend:** ⬜ not started · 🟨 in progress · ✅ done · ⛔ blocked

Per-phase handoff records: [handoffs/](./handoffs/) (written at the end of each phase — see
[../AGENTS.md](../AGENTS.md) § Phase handoffs).

Last updated: _2026-07-23 — Phase 5 complete: Today screen (the core loop). New `useTodayHabits` (`src/data/today.ts`) composes active+scheduled habits × today's check-ins with a memoized per-habit streak (off one `useAllCheckins` subscription); the signature `CheckControl` (radius→circle morph + fill + **SVG stroke-draw check** + `scale.pop`, haptics, a11y checkbox), `ProgressRing` primitive (SVG `strokeDashoffset` + 100% pop/celebrate), `HabitCard` (two ≥48dp targets: body→detail, control→toggle), and `CompletionSummary` ("All done!" at 100%). Added **`react-native-svg@15.15.4`** (user-chosen for the stroke-draws; API verified from source, library-docs §11) + `todayString()`/`formatDayLong()` boundary helpers. Today tab wired thin with a `FadeInDown` entrance stagger + reduced-motion path. tsc/lint clean, expo-doctor 20/20; **core loop verified live on Android emulator (Pixel_10, Expo Go)** — toggle morph + reactive ring, 3/3 "All done!" celebration, correct day-vs-week streak units, card→detail, and a Weekdays habit correctly excluded on a non-scheduled day. iOS unverified (no macOS host)._

---

## Snapshot

| Phase | Title | Status |
| --- | --- | --- |
| 0 | Project scaffold & tooling | ✅ |
| 1 | Design system foundation | ✅ |
| 2 | Data layer (DB, schema, migrations, domain) | ✅ |
| 3 | Navigation shell | ✅ |
| 4 | Create & manage habits | ✅ |
| 5 | Today screen (core loop) | ✅ |
| 6 | Habit detail & history | ⬜ |
| 7 | Settings & data safety | ⬜ |
| 8 | Polish, a11y, performance | ⬜ |

---

## Phase 0 — Scaffold & tooling ✅
- [x] Expo Router app scaffolded (SDK 57, TS) — *already present, not create-expo-app*
- [x] stripped starter boilerplate; routes rebuilt under `src/app/` (tabs + habit/*)
- [x] added deps via bun; removed ❌ `@expo/ui` + `expo-glass-effect`
- [x] NativeWind 4 files (tailwind/metro/babel/global.css) + `nativewind-env.d.ts`;
      `@/` via tsconfig paths (no babel-resolver); **`react-native-worklets/plugin`** last
- [x] theme skeleton: `src/theme/{tokens,colors,useTheme}.ts`
- [x] GestureHandlerRoot + `import '@/global.css'` in root `_layout.tsx`; typedRoutes on
- [x] **Done-when:** iOS bundle builds (1596 modules), `tsc` clean, **expo-doctor 20/20**.
      *(Live on-device dark-flip screenshot pending a simulator/device run.)*

## Phase 1 — Design system foundation ✅
- [x] tokens.ts + global.css variables *(done Phase 0; extended with `z` + `shadow` tokens)*
- [x] tailwind.config color/scale mirror *(done Phase 0)*
- [x] useTheme + `useHabitColors` + `habitColors.ts` palettes (8 keys × light/dark)
- [x] motion.ts spring/timing presets + `useMotion()` reduced-motion wiring
- [x] haptics/id/strings libs (+ logger); full-parity JS color mirror
- [x] primitives: Icon, Text, Surface, Pressable, Button, IconButton, Chip, FAB, TextField, EmptyState
- [x] kitchen-sink screen (`/kitchen-sink`, follows OS scheme)
- [x] **Done-when:** tsc/lint/expo-doctor clean, iOS bundle builds; registry statuses 🟢.
      *(On-device light/dark + reduced-motion visual sign-off pending a simulator run.)*

## Phase 2 — Data layer ✅
- [x] schema.ts (habits + checkins, flat cadence, uniq_habit_day + indexes, cascade FK)
- [x] drizzle.config (dialect sqlite / driver expo) + initial migration `0000_*`
- [x] client.ts (change listeners) + `MigrationGate` + error/loading screens (EmptyState)
- [x] domain: cadence.ts (+7 tests)
- [x] domain: streak.ts (+16 tests — today-grace, weekday skips, ISO weeks, current-week grace, future ignored)
- [x] domain: stats.ts — completionRate/bestStreak/heatmapBuckets (+12 tests)
- [x] data: habits.ts (createHabit/archiveHabit/useHabits/cadenceOf), checkins.ts (toggleCheckin/live reads)
- [x] test tooling: jest **v29** + jest-expo + babel-plugin-inline-import; jest.config (jest-expo/node preset)
- [x] **Done-when:** migration applies on a fresh DB (verified in-memory AND on-device via a
      fresh Expo Go install through `MigrationGate`); domain suite **35/35 green**; throwaway
      kitchen-sink create+toggle **verified re-rendering live through `useLiveQuery`** on an
      Android emulator (0→1 habit; ○🔥0 ↔ ✓🔥1, no red-box).

## Phase 3 — Navigation shell ✅
- [x] (tabs)/_layout native tabs — re-verified against installed expo-router 57.0.8 (unchanged)
- [x] placeholder tab screens (EmptyState) — Today (add-first-habit), Habits (empty + FAB), Settings (shell)
- [x] habit/[id] push + habit/new modal — thin primitive skeletons; `id` param round-trips; modal `router.back()`
- [x] root _layout provider order — GestureHandlerRoot → StatusBar → MigrationGate → Stack (confirmed, unchanged)
- [x] **Done-when:** tab across all 3, open modal + detail push and back out, with native
      transitions + safe areas — **verified live on Android emulator (Pixel_10, Expo Go)**,
      tsc/lint clean, expo-doctor 20/20, no red-box. *(iOS unverified — no macOS host.)*

## Phase 4 — Create & manage habits ✅
- [x] CadencePicker (segmented + weekday chips + stepper) / ColorPicker / IconPicker — all 🟢
- [x] add-habit form (`HabitForm`) → `createHabit` (`habit/new`, appends at end)
- [x] edit form → **`updateHabit`** (new) on a separate `habit/edit/[id]` modal route
- [x] Habits list (`HabitListRow`) + **reorder** (draggable-flatlist → `reorderHabits`) + **archive** (swipe → `archiveHabit`, confirm, hidden)
- [x] validation + inline errors + empty state (FAB always present)
- [x] deleted both Phase-3 throwaways (Settings sample-detail button + `kitchen-sink.tsx`)
- [x] **Done-when:** create/edit/archive/reorder + **relaunch-persistence verified live on
      Android emulator (Pixel_10, Expo Go)**; cadence round-trips (daily / weekdays CSV /
      weekly_count=5); tsc/lint clean, expo-doctor 20/20, no red-box. *(iOS unverified.)*

## Phase 5 — Today screen ✅
- [x] `useTodayHabits` (`src/data/today.ts`) + today check-ins + memoized per-habit streak
      (over one `useAllCheckins` subscription; scheduled-today filter via `isScheduledOn`)
- [x] `CheckControl` — radius→circle morph + fill + **SVG stroke-draw check** + `scale.pop`
      (`springs.bouncy`); `haptic.check`/`uncheck`; reduced-motion cross-fade; a11y checkbox
- [x] `HabitCard` — two ≥48dp targets (body → `habit/[id]`; `CheckControl` → toggle)
- [x] `CompletionSummary` + `ProgressRing` (SVG `strokeDashoffset`) + "All done!" at 100%
      (ring pop + `haptic.celebrate` on the rising edge)
- [x] entrance stagger (`FadeInDown.delay`, capped) + reduced-motion (0 stagger) path
- [x] streak labels — days ("🔥 5") vs weeks ("🔥 3 wk") from `computeStreak`; hidden at 0
- [x] added `react-native-svg@15.15.4` (stroke-draws) + `todayString`/`formatDayLong` helpers
- [x] **Done-when:** <5s check-in; reactive progress; 100% celebration; correct not-scheduled
      exclusion — **verified live on Android emulator (Pixel_10, Expo Go)**; tsc/lint clean,
      expo-doctor 20/20, no red-box. *(iOS unverified — no macOS host.)*

## Phase 6 — Habit detail & history ⬜
- [ ] StreakBadge (current+best)
- [ ] Heatmap + past-day backfill (no future)
- [ ] completion rate/counts (memoized)
- [ ] edit/archive/delete
- [ ] **Done-when:** stats match hand-computed; backfill updates correctly; smooth on big history

## Phase 7 — Settings & data safety ⬜
- [ ] theme mode / accent / week-start (persisted)
- [ ] export JSON
- [ ] import/restore
- [ ] about + version
- [ ] **Done-when:** prefs persist + instant re-theme; export→wipe→import lossless

## Phase 8 — Polish, a11y, performance ⬜
- [ ] ui-rules §1 checklist audit
- [ ] a11y pass
- [ ] perf vs architecture §9 budget
- [ ] empty/error/loading states everywhere
- [ ] icon/splash + EAS build
- [ ] **Done-when:** project-overview §3 goals demonstrably met on device

---

## Decisions log
_Record any deviation from the docs here, with a date and reason, so the docs stay truthful._

- **2026-07-22** — Stack locked: expo-sqlite + Drizzle (local-only, no auth/network);
  NativeWind v4 + custom M3 Expressive tokens; Expo Router file-based + native tabs.
- **2026-07-22** — Reconciled docs to the **real project: Expo SDK 57** (React 19.2, RN
  0.86, Reanimated 4.5), not the SDK-54 assumption. Repo is already scaffolded.
- **2026-07-22** — UI direction decided: **custom NativeWind M3**, not native/glass.
  `@expo/ui` + `expo-glass-effect` to be **removed**; `expo-symbols` allowed only for
  native-tab icons.
- **2026-07-22** — Reanimated 4 babel plugin is **`react-native-worklets/plugin`** (verified
  from installed `react-native-worklets@0.10.0` source), not `react-native-reanimated/plugin`.
- **2026-07-22** — Adopted **opensrc-first** source-of-truth rule ([../AGENTS.md](../AGENTS.md)).
- **2026-07-22 (Phase 1)** — Icon set = **`@expo/vector-icons` / `MaterialCommunityIcons`**
  (cross-platform, typed glyphs); SF Symbols reserved for native tabs only.
- **2026-07-22 (Phase 1)** — IDs via **`expo-crypto.randomUUID()`**, not npm `uuid`
  (that build needs Node `crypto`, absent in RN).
- **2026-07-22 (Phase 1)** — Reanimated shared values use **`.get()`/`.set()`** (not
  `.value =`) for React-Compiler / `react-hooks/immutability` compatibility.
- **2026-07-23 (Phase 2)** — `sqliteTable` extra-config uses the **array form `(t) => [...]`**
  (the object form architecture.md §4 shows is `@deprecated` in drizzle 0.45.2; SQL identical).
- **2026-07-23 (Phase 2)** — **Jest pinned to v29** (jest-expo 57 peers on 29; jest 30 crashes
  with `clearMocksOnScope`). Domain tests run on the `jest-expo/node` preset (pure logic).
- **2026-07-23 (Phase 2)** — Drizzle Expo `.sql` migrations require **`babel-plugin-inline-import`
  + `sourceExts.push('sql')` + a `*.sql` type decl** — corrected the old library-docs §4 claim
  that it works out of the box with babel-preset-expo.
- **2026-07-23 (Phase 2)** — Domain `Cadence` is a **discriminated union decoupled from the DB
  row**; `cadenceOf` in `src/data/habits.ts` is the single flat↔domain bridge (keeps
  `src/domain` free of DB imports).
- **2026-07-23 (Phase 3)** — `habit/new` kept as **`presentation: "modal"`** (not `formSheet`);
  matches architecture §6. On Android `modal` = full-screen push-with-header (no card modal) —
  expected native behavior.
- **2026-07-23 (Phase 3)** — Empty-state primary actions (**Today** + **Habits**/FAB) open the
  real add-habit modal now (`router.push('/habit/new')`) rather than a stubbed no-op.
- **2026-07-23 (Phase 3)** — Detail-push demo is a **clearly-marked throwaway** `outlined`
  button on Settings (delete in Phase 4/6 once Habits list rows link to `habit/[id]`).
- **2026-07-23 (Phase 3)** — `kitchen-sink.tsx` **kept** (not deleted) — still the only
  primitive/DB-reactivity eyeball surface until real feature screens exist (Phase 4/5).
  → **superseded 2026-07-23 (Phase 4): both Phase-3 throwaways deleted** now that real screens
  exist (Habits list rows link to `habit/[id]`/edit; the form exercises `createHabit`/`useLiveQuery`).
- **2026-07-23 (Phase 4)** — **Edit routing = a separate `habit/edit/[id]` modal route**, not a
  `?id` param on `new.tsx`; both render the **same `HabitForm`** so logic stays single-sourced.
- **2026-07-23 (Phase 4)** — **Reorder library = `react-native-draggable-flatlist@4.0.3`**
  (user-chosen). Age is a known risk, mitigated by verifying its reanimated/gesture-handler usage
  against the **installed** 4.5/2.32 source (modern `Gesture` API; symbols all present) — see
  [library-docs.md](./library-docs.md) §10. Runs clean on-device (only a benign internal
  `InteractionManager` deprecation warning).
- **2026-07-23 (Phase 4)** — **Archive = swipe-to-archive** (gesture-handler `ReanimatedSwipeable`,
  confirm `Alert`); **archived habits are hidden, no archived view in v1** (history retained).
- **2026-07-23 (Phase 4)** — **`updateHabit` + `reorderHabits` added** to `src/data/habits.ts`
  (closes the Phase-2 "updateHabit not built" note); `createHabit` now appends at end
  (`sortOrder` = max+1). Reorder writes are an awaited sequence, not a `db.transaction` (the
  expo-sqlite driver is `'sync'`-kind).
- **2026-07-23 (Phase 5)** — **`react-native-svg@15.15.4` added** (user-chosen) for **true SVG
  stroke-draws**: the `CheckControl` check (`Path` `strokeDashoffset`) and `ProgressRing`
  (`Circle`). API verified from installed source before wiring; recorded in library-docs §11.
  In Expo Go's bundled module set (no dev build), but Metro needs `--clear` after install.
- **2026-07-23 (Phase 5)** — **`useTodayHabits` in a new `src/data/today.ts`**; the per-habit
  **streak is computed in the hook (memoized)**, not per-card (§9), from one `useAllCheckins`
  subscription grouped by habit (no N per-card live queries).
- **2026-07-23 (Phase 5)** — **"today" via a shared `todayString()` in `src/lib/date.ts`** (the
  single data-boundary `new Date()`); the domain still never reads the clock. **Week-start
  (Phase 7) intentionally NOT wired** — streaks stay ISO-week / display-agnostic (§7.3).
- **2026-07-23 (Phase 5)** — `CheckControl` fires the haptic in `onPressIn` (picks `check` vs
  `uncheck` from the resulting state) with `scaleOnPress={false}` (the morph is the feedback);
  the fill uses reanimated's documented `'transparent'` interpolation (alpha-0 of the accent).

## Open questions / parking lot
- [ ] Finalize the accent source color → regenerate M3 palette hex in ui-tokens §1.2
      **and** the per-habit hexes in `src/theme/habitColors.ts`.
- [x] ~~Choose the icon set~~ → `@expo/vector-icons`/MaterialCommunityIcons (Phase 1).
- [x] ~~Confirm `NativeTabs` import path is still `unstable-native-tabs` at build time.~~ →
      **confirmed 2026-07-23 (Phase 3):** still `expo-router/unstable-native-tabs` in the
      installed **expo-router 57.0.8**; tabs render live on the Android emulator.
- [ ] On-device visual sign-off of primitives (light/dark + reduced motion) via
      `/kitchen-sink` — deferred from Phase 1 (headless env, no simulator).
- [x] ~~On-device sign-off of the DB layer via `/kitchen-sink`~~ → **verified 2026-07-23** on
      an Android emulator (Pixel_10, Expo Go): app boots through `MigrationGate` (migrations
      applied on a fresh install), `/kitchen-sink` create-habit and toggle-checkin both
      re-render live through `useLiveQuery` (0→1 habit; ○🔥0 ↔ ✓🔥1), no red-box. iOS still
      unverified (no macOS host).
