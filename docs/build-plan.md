# Build Plan — Happit

> The ordered, phased path from empty repo to a working v1. Each phase has a **goal**,
> **concrete tasks**, and a **done-when** bar. Build in order — later phases assume earlier
> ones. Check items off in [progress-tracker.md](./progress-tracker.md).

Scope reference: [project-overview.md](./project-overview.md). Every task obeys
[code-standards.md](./code-standards.md), [ui-rules.md](./ui-rules.md), and
[ui-tokens.md](./ui-tokens.md).

---

## Phase 0 — Project scaffold & tooling

**Goal:** an app that boots on device with the full toolchain wired, showing a themed
"hello".

> **Note:** the repo is **already an Expo SDK 57 Expo Router app** — do NOT run
> `create-expo-app`. Phase 0 is reconciling the existing scaffold to the plan.

Tasks:
- [x] Expo Router app scaffolded (SDK 57, TS). *(already present)*
- [ ] Strip starter boilerplate down to our route structure
      ([architecture.md](./architecture.md) §3).
- [ ] Add the "to add" deps per [library-docs.md](./library-docs.md) §1b; remove the ones
      marked ❌ (`@expo/ui`, `expo-glass-effect`) — we build custom M3, not native/glass.
- [ ] Configure the four NativeWind files + `@/` alias + **`react-native-worklets/plugin`**
      (Reanimated 4, must be last) ([library-docs.md](./library-docs.md) §3).
- [ ] Prettier config; strict `tsconfig`; path alias. (`expo lint` already wired.)
- [ ] `GestureHandlerRootView` + `import '../global.css'` in root `_layout.tsx`.
- [ ] Enable `typedRoutes` in `app.json`.

**Done when:** app runs on iOS + Android, a `className="bg-surface"` element renders and
flips with a manual dark-mode toggle, no red-box, `npx expo-doctor` clean.

---

## Phase 1 — Design system foundation

**Goal:** tokens and primitives exist before any feature uses them.

Tasks:
- [ ] `src/theme/tokens.ts` (spacing, radius, type, motion) mirroring
      [ui-tokens.md](./ui-tokens.md); `global.css` color variables (light + dark).
- [ ] Mirror color roles + scales into `tailwind.config.js`.
- [ ] `ThemeProvider` + `useTheme()`; `src/theme/habitColors.ts` palettes.
- [ ] `src/theme/motion.ts` spring/timing presets; `useReducedMotion` wiring.
- [ ] `src/lib/haptics.ts` semantic wrapper; `src/lib/id.ts`; `src/lib/strings.ts`.
- [ ] Build primitives (see [ui-registry.md](./ui-registry.md)): `Text`, `Surface`,
      `Pressable`, `Button`, `IconButton`, `Chip`, `FAB`, `TextField`, `EmptyState`.
- [ ] A throwaway "kitchen-sink" screen to eyeball every primitive in light/dark.

**Done when:** all primitives render per tokens in both schemes, press motion + haptics
work, reduced-motion path verified. Flip statuses to 🟢 in the registry.

---

## Phase 2 — Data layer (DB, schema, migrations)

**Goal:** persistent, reactive, migrated storage — with the domain logic proven by tests
*before* it's wired to UI.

Tasks:
- [ ] `src/db/schema.ts` exactly per [architecture.md](./architecture.md) §4.
- [ ] `drizzle.config.ts` (driver `expo`); generate initial migration.
- [ ] `src/db/client.ts` (change listeners on); `useMigrations` gate + migration
      loading/error screens ([architecture.md](./architecture.md) §8).
- [ ] **Domain (pure + tested first):** `cadence.ts` `isScheduledOn`; `streak.ts`
      `computeStreak`; `stats.ts` `completionRate`/`bestStreak`/heatmap buckets — with unit
      tests covering every edge case in [architecture.md](./architecture.md) §7
      (today-grace, weekday skips, ISO weekly weeks, travel/DST).
- [ ] `src/data/habits.ts` + `src/data/checkins.ts` (live-query reads, intention-named
      writes).

**Done when:** migrations apply on a fresh install; domain test suite green; a temporary
button can create a habit and toggle a check-in and the change is observed via
`useLiveQuery`.

---

## Phase 3 — Navigation shell

**Goal:** the four-screen skeleton navigable, empty but real.

Tasks:
- [ ] `app/(tabs)/_layout.tsx` native bottom tabs (Today / Habits / Settings).
- [ ] Placeholder tab screens using `EmptyState`.
- [ ] `app/habit/[id].tsx` (push) and `app/habit/new.tsx` (modal) routes wired.
- [ ] Root `_layout.tsx` composes providers in correct order: GestureHandlerRoot → Theme →
      (migrations gate) → Stack/Tabs.

**Done when:** you can tab between screens, open a detail push and a modal, back out —
all with native transitions and safe areas respected.

---

## Phase 4 — Create & manage habits

**Goal:** the full habit CRUD loop.

Tasks:
- [ ] `CadencePicker`, `ColorPicker`, `IconPicker` ([ui-registry.md](./ui-registry.md)).
- [ ] Add-habit form (`app/habit/new.tsx`): name, color, icon, cadence → `createHabit`.
- [ ] Edit reuses the same form; `updateHabit`.
- [ ] Habits tab: `HabitListRow` list, reorder (gesture-handler + `sortOrder`), archive.
- [ ] Validation + error states; empty state when no habits.

**Done when:** can create/edit/archive/reorder habits; data persists across relaunch;
cadence choices round-trip correctly to the flat schema.

---

## Phase 5 — Today screen (the core loop)

**Goal:** the < 5-second daily check-in.

Tasks:
- [ ] `useTodayHabits` (habits where `isScheduledOn(today)` and not archived) +
      today's check-ins.
- [ ] `CheckControl` (signature morph animation, haptics, a11y).
- [ ] `HabitCard` with two tap targets (toggle vs open).
- [ ] `CompletionSummary` + `ProgressRing`; "All done!" celebratory state.
- [ ] List entrance stagger; reduced-motion path.
- [ ] Streak label on each card from `computeStreak`.

**Done when:** launching to a checked-off day takes < 5s; toggling animates + haptic-fires
+ updates progress reactively; 100% triggers celebration; empty state when nothing
scheduled.

---

## Phase 6 — Habit detail & history

**Goal:** trustworthy history and stats.

Tasks:
- [ ] `StreakBadge` (hero), current + best.
- [ ] `Heatmap` calendar; tap past days to backfill (never future).
- [ ] Completion rate + counts from `stats.ts` (memoized).
- [ ] Edit / archive / delete entry points.

**Done when:** stats match hand-computed values on seeded data; backfilling a past day
updates streak/heatmap correctly; large history stays smooth.

---

## Phase 7 — Settings & data safety

**Goal:** preferences and no-data-loss.

Tasks:
- [ ] Theme mode (light/dark/system), accent key, week-start — zustand persisted.
- [ ] Export data (JSON to a file the user picks) and import/restore.
- [ ] About + version.

**Done when:** prefs persist and re-theme instantly; export→wipe→import round-trips all
habits and check-ins losslessly.

---

## Phase 8 — Polish, a11y, performance pass

**Goal:** ship-quality.

Tasks:
- [ ] Full [ui-rules.md](./ui-rules.md) §1 checklist audit on every screen.
- [ ] A11y pass (labels, roles, dynamic type, reduced motion) — [ui-rules.md](./ui-rules.md) §8.
- [ ] Cold-start & interaction perf against [architecture.md](./architecture.md) §9 budget.
- [ ] Empty/error/loading states everywhere ([architecture.md](./architecture.md) §8).
- [ ] Icon/splash, app config, build via EAS.

**Done when:** the ranked goals in [project-overview.md](./project-overview.md) §3 are all
demonstrably met on a real device.

---

## Dependencies between phases

```
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
        └─ domain tests in 2 unblock correct streaks in 5 & 6
1 (primitives) unblocks 4,5,6,7 UI
```

Do not start a phase until its predecessor's "done when" is genuinely met — half-built
foundations are where the slop creeps in.
