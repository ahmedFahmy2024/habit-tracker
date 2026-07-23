# Phase 3 Handoff — Navigation Shell

**Status:** ✅ complete · **Date:** 2026-07-23
**Verified by:** `tsc --noEmit` clean · `expo lint` clean (0 warnings) · `expo-doctor` 20/20 ·
**on-device (Android emulator Pixel_10, Expo Go):** Android bundle built (2107 modules, no
red-box); full done-when flow exercised live — tab **Today → Habits → Settings** (native
bottom tabs), **FAB → New Habit modal** and back out, **"Open sample habit detail" →
`habit/[id]` push** (`id: sample` round-trips) and back out; safe areas respected on every
screen. *(iOS unverified — no macOS host.)*

## What this phase delivered
Maps to [build-plan.md](../build-plan.md) §Phase 3 tasks:

- **Native bottom tabs** (`src/app/(tabs)/_layout.tsx`) — confirmed the Phase-0 `NativeTabs`
  skeleton against the **installed** `expo-router@57.0.8` source. Three triggers (Today /
  Habits / Settings) with per-platform icons (`sf` SF Symbols + `md` Material). No changes
  needed — the API and every glyph name typecheck.
- **Real, empty tab screens built on the Phase-1 primitives** (no more Phase-0 raw
  `Text`/`View` placeholders or the dark-mode toggle):
  - **Today** (`(tabs)/index.tsx`) — full-screen `EmptyState` ("Add your first habit",
    clipboard glyph) whose primary `Button` action opens the add-habit modal via
    `router.push('/habit/new')`. (architecture §8: no bare "No data".)
  - **Habits** (`(tabs)/habits.tsx`) — `EmptyState` ("No habits yet") **plus the extended
    `FAB`** ("+ Add habit", safe-area-aware, lower-right) as the always-present add
    affordance (ui-rules §6). Both open the modal.
  - **Settings** (`(tabs)/settings.tsx`) — minimal titled shell (`Text` primitives). Carries
    a **clearly-marked throwaway** "Open sample habit detail" button (the only entry point to
    the detail push until the Habits list rows exist — Phase 4/6).
- **Detail push + modal routes wired and reachable** (thin, primitive-based skeletons):
  - `habit/[id].tsx` — pushed native-stack screen; reads `useLocalSearchParams` and shows the
    `id` (proves the dynamic param round-trips). Header/back button from the root Stack.Screen.
  - `habit/new.tsx` — modally-presented screen with a "Done" `Button` calling `router.back()`
    (native swipe/back also dismiss).
- **Central strings** — added `today` / `habits` / `settings` / `habitDetail` / `habitNew`
  copy sections to `src/lib/strings.ts` (code-standards §10: no inline user-facing copy).
- **Root layout provider order confirmed** (already correct from Phase 2, left unchanged):
  `GestureHandlerRootView → StatusBar → MigrationGate → Stack` (`(tabs)` + the two `habit/*`
  routes, `habit/new` with `presentation: "modal"`).

## Key files added/changed
- `src/app/(tabs)/index.tsx` — Today screen: `EmptyState` + modal action (rewritten).
- `src/app/(tabs)/habits.tsx` — Habits screen: `EmptyState` + `FAB` (rewritten).
- `src/app/(tabs)/settings.tsx` — Settings minimal shell + throwaway detail-push button (rewritten).
- `src/app/habit/[id].tsx` — detail push skeleton on primitives (rewritten).
- `src/app/habit/new.tsx` — modal skeleton on primitives + `router.back()` (rewritten).
- `src/lib/strings.ts` — added Phase-3 screen copy sections.
- `src/app/(tabs)/_layout.tsx` — **unchanged** (Phase-0 NativeTabs re-verified against source).
- `src/app/_layout.tsx` — **unchanged** (Phase-2 provider order re-confirmed correct).

## Decisions made (and why)
- **`habit/new` stays `presentation: "modal"`** (not `formSheet`) — asked & confirmed with the
  user. Matches architecture §6 ("Modal"), already wired, simplest. On **Android**, `modal`
  renders as a full-screen push-with-header (Android has no iOS card-modal); the header back
  arrow + system back both dismiss. This is expected native behavior, not a bug.
- **Empty-state actions open the real modal now** (asked & confirmed) — Today's "Add your
  first habit" and Habits' "New habit"/FAB all `router.push('/habit/new')`. No throwaway
  needed for the modal path; it's the real intended flow, testable today.
- **Kitchen-sink kept for now** (asked & confirmed) — real Phase-3 screens are empty shells,
  so `/kitchen-sink` is still the only place to eyeball primitives + verify `useLiveQuery`
  reactivity. Delete it in Phase 4/5 when feature screens exercise the same paths.
- **Detail-push demo lives on Settings, marked throwaway** — the done-when bar needs "open a
  detail push and back out", but no screen legitimately links to `habit/[id]` until Habits
  list rows exist (Phase 4). A commented, clearly-labeled throwaway `outlined` button on the
  stable Settings screen provides the reachable entry point; delete it in Phase 4/6.
- **Screens stay thin** (architecture §3): every route file only composes `src/ui` primitives
  + `router` + `strings`. No SQL, no business logic, no `StyleSheet` blocks — spacing via
  `space` tokens and `className`.

## Gotchas / things the next agent must know
- **opensrc returned a STALE expo-router (56.2.7)** for `--cwd .`; the **installed** version is
  **57.0.8** (`node_modules/expo-router/package.json`). Per AGENTS.md, all navigation APIs
  this phase were verified against `node_modules`, not the opensrc clone. `unstable-native-tabs`
  is still the correct import path in 57.0.8 (**parking-lot item now closed** — see below).
- **NativeTabs API surface (verified in installed source):** `NativeTabs` +
  `NativeTabs.Trigger` (renders `null` — it's config, not UI) + `.Trigger.Label` (takes a
  string child) + `.Trigger.Icon` (`sf: SFSymbol`, `md: AndroidSymbol`, `src`, `xcasset`,
  `drawable`). `sf` is a union from `sf-symbols-typescript`; `md` is `keyof symbols.json` from
  `expo-symbols`. All three tab glyphs (`checkmark.circle.fill`/`check_circle`,
  `list.bullet`/`list`, `gearshape.fill`/`settings`) are valid members — verified.
- **`presentation` union (verified):** the native-stack Screen `presentation` accepts
  `'modal' | 'formSheet' | 'pageSheet' | 'card' | …` — `'modal'` typechecks and works.
- **typedRoutes is on:** `router.push('/habit/new')` and `router.push('/habit/sample')` both
  satisfy the generated `Href` type (dynamic `[id]` accepts a literal segment). tsc is the
  gate — it passed.
- **The floating gear circle in screenshots is the Expo Go dev-menu overlay**, not app UI.
- **Benign teardown log:** `UIManagerHelper: ...ReactNoCrashSoftException: Cannot get UIManager
  because the context doesn't contain an active React instance` appears when a *previous* Expo
  Go instance is torn down on reload/force-stop. It is not a red-box and did not occur during
  the actual nav flow. Ignore it.
- **No metro/babel config was touched this phase**, so no `--clear` was strictly required; it
  was used anyway on the verification run to rule out a stale bundle.

## What is NOT done yet (deferred)
- **iOS not verified** — Android emulator only (no macOS host). Re-check the modal *card*
  presentation on iOS when a Mac is available (Android renders `modal` as full-screen).
- **All tab screens are empty shells** — no habit list, no CheckControls, no stats. Real
  content: Habits list + CRUD (Phase 4), Today loop (Phase 5), detail history (Phase 6),
  Settings prefs (Phase 7).
- **Throwaways still in the tree:** the Settings "Open sample habit detail" button (delete in
  Phase 4/6) and the whole `kitchen-sink.tsx` + its Phase-2 DB section (delete in Phase 4/5).
- **Phase-1 primitive visual sign-off** (light/dark + reduced motion via `/kitchen-sink`)
  remains deferred; this phase confirmed the nav shell in light mode only.

## Next phase
- **Phase 4 — Create & manage habits** ([build-plan.md](../build-plan.md) §Phase 4): the full
  CRUD loop. First tasks: build `CadencePicker` / `ColorPicker` / `IconPicker`
  ([ui-registry.md](../ui-registry.md)); flesh out `habit/new.tsx` into the real add form
  (name, color, icon, cadence) calling `createHabit`; reuse it for edit via `updateHabit`
  (**note: `updateHabit` is not built yet** — add it to `src/data/habits.ts`); build the
  Habits tab `HabitListRow` list with reorder (gesture-handler + `sortOrder`) and archive.
  Delete the Settings throwaway detail-push button once list rows link to `habit/[id]`.
