# Phase 4 Handoff — Create & Manage Habits (CRUD)

**Status:** ✅ complete · **Date:** 2026-07-23
**Verified by:** `tsc --noEmit` clean · `expo lint` clean (0 warnings) · `expo-doctor` 20/20 ·
**on-device (Android emulator Pixel_10, Expo Go):** full CRUD loop exercised live and the
**whole thing round-trips a relaunch** — created a **Daily** habit ("Drink water", green/water),
a **Weekdays** habit ("Read book", blue/pencil, Mon–Fri → summarized "Weekdays"), and a third
Daily ("Meditate", purple); **edited** "Read book" to **Times/week = 5** (row updated to
"5× a week"); **reordered** Meditate to the top via its drag handle; **swiped** "Read book" →
Archive → confirm dialog → archived (drops out of the list, history kept); then **force-stopped
+ cold-relaunched** Expo Go and all of it persisted (both habits present, Meditate still first,
Read book still hidden). No red-box. *(iOS unverified — no macOS host.)*

## What this phase delivered
Maps to [build-plan.md](../build-plan.md) §Phase 4 tasks:

- **Three pickers** (`src/ui/habit/`, all registered in [ui-registry.md](../ui-registry.md) and
  flipped 🟢):
  - **`CadencePicker`** — a segmented control (Daily / Weekdays / Times-per-week) with an animated
    highlight pill; Weekdays reveals 7 weekday `Chip`s (Sunday-first display, `Weekday` numbers
    0=Sun..6=Sat), Times/week reveals a −N+ stepper (1..7). Emits the normalized domain `Cadence`
    union; the data layer flattens it.
  - **`ColorPicker`** — grid of the 8 habit color swatches (palette `accent`); selection morphs
    (ring + `springs.bouncy` pop) + `haptic.select`; stores the **key**.
  - **`IconPicker`** — grid over a curated 28-name `HABIT_ICONS` list (every name validated against
    the installed MaterialCommunityIcons glyphmap); selected cell tints with the habit accent;
    stores the icon-set **name**.
- **`HabitForm`** (🟢) — the shared add/edit form: `TextField` + the three pickers, validation
  (name required; weekdays ≥1 day; weekly target ≥1) with inline errors, spinner on submit. It's
  presentation-only; routes own the write + dismissal.
- **Add + Edit, same form, different routes:**
  - `habit/new.tsx` — thin: renders `HabitForm` with `NEW_HABIT_DEFAULTS`, calls `createHabit`,
    `router.back()` on success.
  - `habit/edit/[id].tsx` — **new modal route**: loads via `useHabit(id)`, maps the flat row →
    form values (`cadenceOf` bridges the cadence), saves via `updateHabit`, dismisses. Handles the
    live-query loading gap (`updatedAt` undefined) and a genuine not-found (`EmptyState`).
- **Data layer additions** (`src/data/habits.ts`):
  - **`updateHabit(id, {name,color,icon,cadence})`** — the edit writer (didn't exist before).
  - **`reorderHabits(ids)`** — persists a new order by writing each row's `sortOrder = index`.
  - `createHabit` now **appends at end** by default (`nextSortOrder()` = max+1) instead of `0`.
- **Real Habits tab** (`(tabs)/habits.tsx`) — a `DraggableFlatList` off `useHabits`: each
  `HabitListRow` (accent icon chip, name, cadence summary) taps to edit, has a drag handle to
  reorder (persisted via `reorderHabits`), and swipes left to reveal an error-tinted **Archive**
  action → confirm `Alert` → `archiveHabit`. Empty state + FAB remain when there are no habits.
- **`cadenceSummary`** (`src/lib/cadence.ts`) — pure formatter for the row's cadence line
  ("Every day" / "Weekdays" / "Weekends" / "Mon, Wed, Fri" / "5× a week").
- **Throwaways removed** (both, per the Phase-3 plan): the Settings "Open sample habit detail"
  button and the entire `kitchen-sink.tsx` route (+ its Phase-2 DB section).

## Key files added/changed
- `src/ui/habit/{CadencePicker,ColorPicker,IconPicker,HabitForm,HabitListRow}.tsx` + `index.ts` — new.
- `src/app/habit/new.tsx` — rewritten thin over `HabitForm` + `createHabit`.
- `src/app/habit/edit/[id].tsx` — **new** modal edit route.
- `src/app/(tabs)/habits.tsx` — rewritten: live reorderable/archivable `DraggableFlatList`.
- `src/app/(tabs)/settings.tsx` — throwaway detail-push button removed.
- `src/app/_layout.tsx` — registered `habit/edit/[id]` (modal); titles now from `strings`.
- `src/data/habits.ts` — added `updateHabit`, `reorderHabits`, `nextSortOrder`; `createHabit` appends.
- `src/lib/{cadence.ts,strings.ts,index.ts}` — cadence summary helper + all Phase-4 copy.
- `src/app/kitchen-sink.tsx` — **deleted**.
- `docs/library-docs.md` §10 — the reorder/archive libraries + source-verification notes.
- `docs/ui-registry.md` — pickers/HabitListRow/HabitForm specs + statuses 🟢.

## Decisions made (and why) — all four confirmed with the user
- **Edit routing = separate `habit/edit/[id].tsx`** (not reusing `new.tsx` with an optional id).
  Both screens render the **same `HabitForm`**, so form/validation logic still lives once; the
  separate route gives clean typed-route URLs and screen identity.
- **Reorder = `react-native-draggable-flatlist@4.0.3`.** The list library was chosen despite its
  age; **verified against the installed reanimated 4.5 + gesture-handler 2.32 source** before
  wiring (it uses the modern `Gesture`/`GestureDetector` API and only reanimated symbols still
  present in 4.5 — see [library-docs.md](../library-docs.md) §10). Runs clean on-device.
- **Archive = swipe-to-archive** via gesture-handler's `ReanimatedSwipeable` (subpath import),
  with a confirm `Alert`; **archived habits are just hidden** (`useHabits` filters
  `archivedAt IS NULL`) — **no archived-habits view in v1**.
- **Both Phase-3 throwaways deleted now** — list rows link to `habit/[id]`/`edit` and the real
  screens exercise `createHabit`/`useLiveQuery`, so the sample-detail button and kitchen-sink are
  redundant.

## Gotchas / things the next agent must know
- **`updateHabit` now exists** in `src/data/habits.ts` (the Phase-2 handoff's "not built" note is
  closed). It sets name/color/icon/cadence only; `sortOrder`/`archivedAt` have their own writers.
- **The expo-sqlite Drizzle driver is `'sync'`-kind** (verified in source). `reorderHabits`
  therefore issues its per-row `sortOrder` updates as an awaited sequence (not a `db.transaction`
  with an async callback, which would mismatch the sync result kind). Fine for our list sizes.
- **`ReanimatedSwipeable` import path is the subpath** `react-native-gesture-handler/ReanimatedSwipeable`
  — the package root `index` only re-exports the **legacy** `Swipeable`.
- **Benign library warning on-device:** `InteractionManager has been deprecated …` — emitted by
  draggable-flatlist internally, **not** our code and **not** a red-box. Expected given the lib's
  age. (Along with the usual `UIManagerHelper … ReactNoCrashSoftException` teardown log.)
- **Typed routes need regeneration after adding a route:** the new `habit/edit/[id]` wasn't in
  `.expo/types/router.d.ts` until the router typegen ran (Metro start regenerates it; I forced it
  with `bunx expo customize tsconfig.json` to get a clean `tsc` before starting Metro).
- **Week-start is display-only and not wired yet** — `CadencePicker`/`cadenceSummary` default to
  Sunday-first. The Phase-7 week-start pref should reorder the weekday chip DISPLAY only; it must
  never touch the stored `Weekday` numbers or the domain (architecture §7.2).
- **The emulator's "Try out your stylus" IME promo** can hijack `adb input text` on first focus;
  dismiss it (Cancel) and re-type. Not an app issue.

## What is NOT done yet (deferred)
- **iOS not verified** — Android emulator only (no macOS host). Re-check the modal card
  presentation + swipe/drag feel on iOS when a Mac is available.
- **No archived-habits view / un-archive** — v1 hides archived habits and keeps history; there's no
  UI to see or restore them (the confirm dialog says as much). Revisit if scope grows.
- **No hard delete** — only soft archive (`archivedAt`). A destructive delete entry point is a
  Phase-6 detail-screen concern if wanted.
- **`updateHabit`/`reorderHabits` have no integration tests** — correctness was proven on-device;
  a temp-sqlite integration test remains the reasonable add flagged since Phase 2.
- **Primitive light/dark + reduced-motion visual sign-off** still deferred (kitchen-sink is gone;
  a future visual pass can eyeball the real screens instead).

## Next phase
- **Phase 5 — Today screen (the core loop)** ([build-plan.md](../build-plan.md) §Phase 5): the
  <5-second daily check-in. First tasks: `useTodayHabits` (habits where `isScheduledOn(today)` and
  not archived) + today's check-ins; the signature **`CheckControl`** (shape-morph + haptics +
  a11y); **`HabitCard`** with two tap targets (toggle vs open); **`CompletionSummary` +
  `ProgressRing`** with the "All done!" celebration; list entrance stagger + reduced-motion; and a
  streak label per card from `computeStreak`. The `toggleCheckin` writer + `useCheckinsForDay`
  reader already exist from Phase 2.
