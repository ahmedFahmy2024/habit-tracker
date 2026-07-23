# Progress Tracker — Happit

> Living status of the build. Update this as you go. Mirrors the phases in
> [build-plan.md](./build-plan.md). Keep it honest — a box is only checked when its
> "done when" bar is actually met.

**Legend:** ⬜ not started · 🟨 in progress · ✅ done · ⛔ blocked

Per-phase handoff records: [handoffs/](./handoffs/) (written at the end of each phase — see
[../AGENTS.md](../AGENTS.md) § Phase handoffs).

Last updated: _2026-07-23 — **Phase 8 complete (✅) — v1 feature-complete.** Polish/a11y/perf pass + closed the three inherited Phase-7 on-device gaps (so **Phase 7 flipped 🟨→✅**): the `.dark:root` surface flip, the export→wipe→import round-trip (lossless — "Restored 2 habits and 3 check-ins", streaks recomputed 🔥2), and the week-start chip reorder are all **confirmed live on the Pixel_10**. Wired the **accent preference** to re-tint app chrome (FAB + all `Button` variants + Today `ProgressRing` + "All done!") via a new `useAccent()` hook + an `onAccent` palette token (AA-checked) — habit cards keep their own color (verified purple accent live). Full **ui-rules §1** + **a11y §8** audit (dynamic type scales to 1.5× without clipping); **§8 empty/error/loading** states all real; **§9** perf sound (memoized stats, no theme flash on cold start). **App icon + splash + config**: generated M3 brand assets (green squircle + cream check) via `scripts/gen-icons.mjs`; `app.json` → name **Happit** / slug+scheme `happit` / cream+dark splash / bundle id `com.happit.app`; **local `expo prebuild` succeeds clean** (real EAS build deferred by decision). tsc / lint (0) / expo-doctor 20/20 / 35 domain tests green. project-overview §3 goals demonstrably met on-device. iOS unverified (no macOS host). See [handoffs/phase-8-polish.md](./handoffs/phase-8-polish.md)._

<!-- prior: _2026-07-23 — Phase 7 code-complete (🟨, on-device confirmation pending): Settings & data safety. Persisted zustand prefs store (`src/store/preferences.ts`) — theme mode / accent / week-start in a `key_value` sqlite table, hydrated **synchronously** (no theme flash); `ThemeSync` drives NativeWind `setColorScheme` (system follows OS). Week-start is **display-only** (`src/lib/weekOrder.ts` — reorders CadencePicker chips + Heatmap legend/rows; 35 domain tests still green). Lossless **export/import** (`src/data/backup.ts`) — versioned JSON via `expo-file-system` File/Paths + `expo-sharing`; import picks (`expo-document-picker`), validates (rejects newer version + orphan check-ins), and **replace-all in one `withTransactionSync`**. Thin Settings screen + new `SegmentedControl`/`SettingsSection`/`SettingsRow`; accent picker reuses `ColorPicker`; About+version from `expo-constants`. New deps: `expo-file-system`/`expo-sharing`/`expo-document-picker` + migration `0001` (key_value). **Found + fixed a latent dark-theme bug: `global.css` dark variables need `.dark:root`, not a bare `.dark`, or surfaces don't flip on native.** tsc/lint (0 warnings)/expo-doctor 20/20 clean; logic proven by a Node script. **On-device: Settings renders + prefs persist + theme flips habit colors/native tabs verified; the `.dark:root` surface-flip fix and the export→wipe→import round-trip are NOT yet live-confirmed** (emulator/adb wedged during testing) — see [handoffs/phase-7-BLOCKERS.md](./handoffs/phase-7-BLOCKERS.md). iOS unverified._ -->

<!-- prior: _2026-07-23 — Phase 6 complete: Habit detail & history (trustworthy stats). New `useHabitStats(id, today)` (`src/data/habitStats.ts`) derives current/best streak, completion %, heatmap buckets, and total count from the pure domain in one §9-memoized `useMemo`; the `StreakBadge` hero (`display.medium` emphasized, accent-tinted, quiet "No streak yet" at 0), the `Heatmap` (**pure View/flex grid**, last 26 weeks, horizontally scrollable; per-cell `Pressable` backfill of past/today via `toggleCheckin`, future cells inert; done=accent / missed=`errorContainer` / unscheduled=`surfaceContainerHighest`), a 3-stat row (Best · Completion · Check-ins), and Edit/Archive/**Delete** actions. Added the **`deleteHabit`** hard-delete writer + **`PRAGMA foreign_keys = ON`** (so the checkins FK cascade actually fires) + `formatDayShort` + `heatmap.*` geometry tokens. `habit/[id].tsx` rewritten thin (loading gap + not-found). tsc/lint clean, expo-doctor 20/20; **verified live on Android emulator (Pixel_10, Expo Go)** — created a daily habit, opened detail, **backfilled a past day** (Best/Completion/Check-ins + heatmap cell update reactively), **checked today** → "🔥 1 day streak", un-check reversed it, Edit pre-populated, **Delete → destructive confirm → hard delete + cascade** (Today empty). The exact stat pipeline also hand-verified against a throwaway domain script (4 cadence cases, all exact). iOS unverified (no macOS host). NOTE: the Pixel_10 AVD needed `-memory 3072` — at its default 2 GB the low-memory-killer bounced Expo Go._ -->

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
| 6 | Habit detail & history | ✅ |
| 7 | Settings & data safety | ✅ |
| 8 | Polish, a11y, performance | ✅ |

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

## Phase 6 — Habit detail & history ✅
- [x] `StreakBadge` (current + best; `display.medium` emphasized, accent-tinted, quiet "No streak yet" at 0)
- [x] `Heatmap` (pure View/flex grid, last 26wk, horizontal scroll; past/today `Pressable` backfill → `toggleCheckin`; future cells inert; done=accent / missed=`errorContainer` / unscheduled=`surfaceContainerHighest`)
- [x] completion rate + counts, **memoized** in `useHabitStats(id, today)` (§9 key `(habitAt, checkinsAt, today, id)`)
- [x] edit (→`habit/edit/[id]`) / archive (`archiveHabit`, confirm) / **delete** (new `deleteHabit` hard-delete + destructive confirm + FK cascade; `PRAGMA foreign_keys = ON`)
- [x] `habit/[id].tsx` rewritten thin (loading gap + `EmptyState` not-found; dynamic header title)
- [x] **Done-when:** stats match hand-computed (throwaway domain script + on-device) — **verified
      live on Android emulator (Pixel_10, Expo Go)**: backfill updates streak/heatmap/stats
      reactively; check-today→"🔥 1"; future never toggled; edit/archive/delete work; tsc/lint
      clean, expo-doctor 20/20, no red-box. *(iOS unverified — no macOS host.)*

## Phase 7 — Settings & data safety ✅ (on-device gaps closed in Phase 8)
- [x] theme mode / accent / week-start — **persisted** in a `key_value` sqlite table, hydrated
      **synchronously** (no theme flash); `ThemeSync` drives NativeWind `setColorScheme` (system
      follows OS). Store: `src/store/preferences.ts`.
- [x] week-start = **display-only** (`src/lib/weekOrder.ts`) — reorders CadencePicker chips +
      Heatmap legend/rows; domain untouched (35 domain tests still green).
- [x] export JSON — `src/data/backup.ts`: versioned `{version,exportedAt,habits[],checkins[]}`
      to a file (`expo-file-system` File/Paths) + share sheet (`expo-sharing`).
- [x] import/restore — pick (`expo-document-picker`) → validate (rejects newer version + orphan
      check-ins) → **replace-all in one `withTransactionSync`** (lossless, all-or-nothing).
- [x] about + version (`Constants.expoConfig?.version`)
- [x] thin Settings screen + new `SegmentedControl` / `SettingsSection` / `SettingsRow` (🟢);
      accent picker = reuse `ColorPicker`.
- [x] tsc / lint (0 warnings) / expo-doctor 20/20 clean; logic proven by a throwaway Node script.
- [x] **Done-when (met — gaps closed in Phase 8, verified live on Pixel_10):** prefs persist +
      instant re-theme (habit colors + native tabs + **NativeWind surfaces flip via `.dark:root`**);
      **export→wipe→import round-trip lossless** ("Restored 2 habits and 3 check-ins", streaks
      recomputed); week-start chip reorder. See [handoffs/phase-8-polish.md](./handoffs/phase-8-polish.md)
      (a)/(b)/(c). *(iOS unverified — no macOS host.)*

## Phase 8 — Polish, a11y, performance ✅
- [x] closed the three inherited Phase-7 on-device gaps (dark surfaces / export-import / week-start) — verified live
- [x] **accent preference wired** — `useAccent()` + `onAccent` token re-tint FAB + all `Button`
      variants + Today `ProgressRing` + "All done!"; habit cards keep their own color (verified live)
- [x] ui-rules §1 checklist audit — every screen (tokens only, motion+haptics, ≥48dp, reduced-motion, AA, one accent/surface)
- [x] a11y pass (§8) — roles/labels/states; **dynamic type to 1.5× without clipping** (verified live); color never the only signal
- [x] perf vs architecture §9 — memoized stats, 26wk heatmap smooth, **no theme flash on cold start**
- [x] empty/error/loading states everywhere (§8) — all real (migration/no-habits/nothing-due/not-found/backup)
- [x] icon/splash + app config + **local prebuild clean** (`scripts/gen-icons.mjs`; name Happit / bundle id com.happit.app; real EAS build deferred by decision)
- [x] **Done-when:** project-overview §3 goals demonstrably met on the Pixel_10 (frictionless <5s
      check-in · M3 Expressive · trustworthy streaks/history · zero data loss). tsc/lint/doctor
      clean, 35 domain tests green. *(iOS unverified — no macOS host.)*

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
- **2026-07-23 (Phase 6)** — **Hard delete added** (`deleteHabit`, new writer) on the detail
  screen with a destructive confirm `Alert`, alongside Edit + Archive. Relies on the
  `checkins.habitId` FK cascade — which required **`PRAGMA foreign_keys = ON`** in `client.ts`
  (SQLite defaults it OFF per connection; expo-sqlite doesn't override). Archive stays the
  soft-hide.
- **2026-07-23 (Phase 6)** — **Heatmap = a pure View/flex grid** (not `react-native-svg`), last
  **26 weeks**, horizontally scrollable. A `Pressable`-per-cell makes tap→`day` mapping + the 48dp
  hit area trivial (SVG hit-testing would be fiddlier); future cells are inert `View`s. Backfill is
  limited to the visible window. Cell fills are roles/accent only (ui-tokens §9).
- **2026-07-23 (Phase 6)** — **Stats derived in a `useHabitStats(id, today)` data hook** (not in
  the route), one §9-memoized `useMemo` keyed on `(habitAt, checkinsAt, today, id)` — the
  live-query `updatedAt`s are the `checkinsVersion`. Keeps `habit/[id].tsx` thin (architecture §3)
  and mirrors the `useTodayHabits` pattern.
- **2026-07-23 (Phase 6)** — **Detail header = StreakBadge hero + a 3-stat row** (Best ·
  Completion % · total Check-ins). Current streak is the `display.medium`-emphasized,
  accent-tinted hero; completion % is over the visible 26-week window so it agrees with the heatmap.
- **2026-07-23 (Phase 6)** — On-device verification needed the Pixel_10 AVD booted with
  **`-memory 3072`**; at its default **2 GB** the low-memory-killer repeatedly bounced Expo Go to
  the launcher (`adb logcat … "mem-pressure-event"`). Not a code issue.
- **2026-07-23 (Phase 7)** — **Prefs persistence = a `key_value` sqlite table hydrated
  synchronously** (`expoDb.getFirstSync` at store module-load), **not** zustand `persist` /
  AsyncStorage — the sync read is present on first paint, so **no theme flash**; no new dep.
- **2026-07-23 (Phase 7)** — **`system` theme = NativeWind `setColorScheme('system')`** (native OS
  follow); explicit light/dark override it. One code path via `ThemeSync` (inside MigrationGate);
  no inline light/dark branches.
- **2026-07-23 (Phase 7)** — **Import = replace-all in one `withTransactionSync`, versioned +
  validated** (rejects a newer `version` and orphan check-ins); export/import file shape is
  `{version,exportedAt,habits[],checkins[]}` (raw rows) delivered via `expo-sharing` /
  `expo-document-picker`. Prefs are NOT in the backup.
- **2026-07-23 (Phase 7)** — **⚠️ `global.css` dark CSS variables must use `.dark:root`, not a
  bare `.dark`.** On native, `react-native-css-interop` only registers dark *variables* from a
  `.dark:root` / `:root[class~="dark"]` selector (verified in `css-to-rn/normalize-selectors.js`
  `isRootDarkVariableSelector`); a bare `.dark { --x }` is a descendant style rule, so surfaces
  don't flip in dark mode. Latent pre-Phase-7 bug (no phase had eyeballed dark surfaces on-device)
  — fixed. Needs a Metro `--clear` after the change.
- **2026-07-23 (Phase 7)** — **`importData` reads the picked file per-platform:** Android
  `copyToCacheDirectory:false` + read the SAF `content://` in place (Expo Go denies READ on the
  picker's app-cache copy → `ERR_INVALID_PERMISSION`); iOS keeps the copy. Verified from installed
  expo source.
- **2026-07-23 (Phase 7)** — **Week-start is display-only** via pure `src/lib/weekOrder.ts`
  (`weekdayDisplayOrder` / `reorderBySunday`); `src/domain` never receives `weekStart`. The old
  Sunday-first `WEEKDAY_DISPLAY_ORDER` constant was removed as superseded. 35 domain tests confirm
  no streak/schedule regression.
- **2026-07-23 (Phase 8)** — **Global accent preference re-tints app chrome only** (FAB + all
  `Button` variants + Today `ProgressRing` + "All done!"), via a new **`useAccent()`** hook (the one
  place chrome reads the persisted `accentKey`) + a new **`onAccent`** palette token (white on light
  accents ≥5.5:1, black on dark pastels ≥12:1). Per-habit surfaces (cards, `CheckControl`) keep
  their OWN color via `useHabitColors` — the accent never overrides those. `SegmentedControl`
  selected tint + `TextField` focus stay on the neutral M3 `primary`/`primaryContainer` roles
  (out of the accent's scope). `Text` gained a `colorValue?` raw override (mirrors `Icon.colorValue`)
  for the accent on-color.
- **2026-07-23 (Phase 8)** — **`CheckControl` check mark uses the palette `onAccent`** (was
  `colors.surface`) — semantically correct + marginally higher contrast on the filled accent circle.
- **2026-07-23 (Phase 8)** — **Brand assets generated from the M3 palette** (green `#386a20`
  squircle + cream `#fdfcf5` check) via a pure-Node **pngjs** rasterizer (`scripts/gen-icons.mjs`) —
  no sharp/SVG rasterizer available on this Windows host. Placeholder-quality; re-run the script
  with the finalized accent hue to regenerate. Removed the default `assets/expo.icon` bundle.
- **2026-07-23 (Phase 8)** — **`app.json`: name `Happit`, slug + scheme `happit`, bundle id
  `com.happit.app`** (iOS + Android), cream + dark splash (`resizeMode: contain`, `imageWidth: 160`),
  cream adaptive-icon background. **EAS = local prebuild only** (user decision, no account-touching
  action): `expo prebuild --platform android` succeeds clean; the real cloud build/submit is
  deferred (use the `eas-app-stores` skill with the user's credentials when wanted).
- **2026-07-23 (Phase 8)** — **The benign yellow "!" dev toast is
  `react-native-draggable-flatlist`'s `InteractionManager` deprecation warning** (not our code, not
  an error). Its invisible bottom overlay can eat taps on bottom-pinned buttons in Expo Go; a reload
  clears it. Candidate tidy-up: `LogBox.ignoreLogs(['InteractionManager has been deprecated'])`.
- **2026-07-23 (Phase 8)** — **Production cold-start (<1.5s) is not measurable in Expo Go** (dev
  bundle download + dev transforms inflate it); the architecture meets the budget by design (Hermes,
  sync prefs hydration → no theme flash confirmed on a cold launch, tiny migration, memoized stats).
  A real number needs a release build / EAS Observe — deferred with the local-prebuild-only decision.

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
