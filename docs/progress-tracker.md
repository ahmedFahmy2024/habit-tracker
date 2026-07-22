# Progress Tracker — Happit

> Living status of the build. Update this as you go. Mirrors the phases in
> [build-plan.md](./build-plan.md). Keep it honest — a box is only checked when its
> "done when" bar is actually met.

**Legend:** ⬜ not started · 🟨 in progress · ✅ done · ⛔ blocked

Per-phase handoff records: [handoffs/](./handoffs/) (written at the end of each phase — see
[../AGENTS.md](../AGENTS.md) § Phase handoffs).

Last updated: _2026-07-22 — Phase 1 complete: theme built out (habitColors, motion + reduced-motion), lib helpers (haptics/id/strings/logger), and all 9 primitives + Icon; kitchen-sink screen. tsc/lint/expo-doctor clean, iOS bundle 1650 modules._

---

## Snapshot

| Phase | Title | Status |
| --- | --- | --- |
| 0 | Project scaffold & tooling | ✅ |
| 1 | Design system foundation | ✅ |
| 2 | Data layer (DB, schema, migrations, domain) | ⬜ |
| 3 | Navigation shell | ⬜ |
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

## Phase 2 — Data layer ⬜
- [ ] schema.ts
- [ ] drizzle.config + initial migration
- [ ] client.ts (change listeners) + migrations gate + error/loading screens
- [ ] domain: cadence.ts (+tests)
- [ ] domain: streak.ts (+tests, all §7 edge cases)
- [ ] domain: stats.ts (+tests)
- [ ] data: habits.ts, checkins.ts
- [ ] **Done-when:** migrations apply fresh; domain tests green; create+toggle observed live

## Phase 3 — Navigation shell ⬜
- [ ] (tabs)/_layout native tabs
- [ ] placeholder tab screens (EmptyState)
- [ ] habit/[id] push + habit/new modal
- [ ] root _layout provider order
- [ ] **Done-when:** navigate all screens with native transitions + safe areas

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

## Open questions / parking lot
- [ ] Finalize the accent source color → regenerate M3 palette hex in ui-tokens §1.2
      **and** the per-habit hexes in `src/theme/habitColors.ts`.
- [x] ~~Choose the icon set~~ → `@expo/vector-icons`/MaterialCommunityIcons (Phase 1).
- [ ] Confirm `NativeTabs` import path is still `unstable-native-tabs` at build time.
- [ ] On-device visual sign-off of primitives (light/dark + reduced motion) via
      `/kitchen-sink` — deferred from Phase 1 (headless env, no simulator).
