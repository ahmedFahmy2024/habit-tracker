# Progress Tracker — Happit

> Living status of the build. Update this as you go. Mirrors the phases in
> [build-plan.md](./build-plan.md). Keep it honest — a box is only checked when its
> "done when" bar is actually met.

**Legend:** ⬜ not started · 🟨 in progress · ✅ done · ⛔ blocked

Per-phase handoff records: [handoffs/](./handoffs/) (written at the end of each phase — see
[../AGENTS.md](../AGENTS.md) § Phase handoffs).

Last updated: _2026-07-23 — Phase 3 complete: navigation shell. Native bottom tabs (Today/Habits/Settings) re-verified against installed expo-router 57.0.8; empty tab screens rebuilt on the Phase-1 `EmptyState`/`FAB`/`Button` primitives; `habit/[id]` push + `habit/new` modal wired and reachable; root provider order confirmed (GestureHandlerRoot → StatusBar → MigrationGate → Stack). tsc/lint clean, expo-doctor 20/20; full tab→modal→detail flow with native transitions + safe areas **verified live on an Android emulator (Pixel_10, Expo Go)**, no red-box. iOS unverified (no macOS host)._

---

## Snapshot

| Phase | Title | Status |
| --- | --- | --- |
| 0 | Project scaffold & tooling | ✅ |
| 1 | Design system foundation | ✅ |
| 2 | Data layer (DB, schema, migrations, domain) | ✅ |
| 3 | Navigation shell | ✅ |
| 4 | Create & manage habits | ⬜ |
| 5 | Today screen (core loop) | ⬜ |
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

## Phase 4 — Create & manage habits ⬜
- [ ] CadencePicker / ColorPicker / IconPicker
- [ ] add-habit form → createHabit
- [ ] edit form → updateHabit
- [ ] Habits list (HabitListRow) + reorder + archive
- [ ] validation + empty state
- [ ] **Done-when:** CRUD persists across relaunch; cadence round-trips

## Phase 5 — Today screen ⬜
- [ ] useTodayHabits + today check-ins
- [ ] CheckControl (morph + haptics + a11y)
- [ ] HabitCard (two targets)
- [ ] CompletionSummary + ProgressRing + "All done!"
- [ ] entrance stagger + reduced-motion
- [ ] streak labels
- [ ] **Done-when:** <5s check-in; reactive progress; 100% celebration; empty state

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
