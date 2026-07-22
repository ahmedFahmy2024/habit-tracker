# Phase 1 Handoff — Design System Foundation

**Status:** ✅ complete · **Date:** 2026-07-22
**Verified by:** `tsc --noEmit` clean · `expo lint` clean · `expo-doctor` 20/20 · iOS export
bundles (1650 modules, MaterialCommunityIcons.ttf bundled). *(Live on-device light/dark +
reduced-motion visual check still pending a simulator/device run — see "What is NOT done".)*

## What this phase delivered
Maps to [build-plan.md](../build-plan.md) §Phase 1 tasks:

- **Theme built out** (`src/theme/`):
  - `habitColors.ts` — 8 per-habit tonal palettes (`green blue orange purple red teal pink
    yellow`), each a `{container, onContainer, accent}` triple tuned separately for
    light/dark (docs/ui-tokens.md §1.3). `habitColors(scheme,key)` + `useHabitColors(key)`.
  - `motion.ts` — reanimated spring/timing presets from tokens (docs/ui-tokens.md §6),
    M3 easing curves, and a `useMotion()` hook that folds in reduced motion (springs/scales
    → instant, stagger → 0).
  - `colors.ts` — extended the JS color mirror to **full role parity** with `global.css`
    (added the container `on-*` roles, `surfaceContainerLowest/Low/Highest`, inverse roles)
    so no JS consumer needs an inline hex.
  - `tokens.ts` — added `z` (layering) and `shadow` (FAB/dragged RN shadow values) tokens.
  - `index.ts` barrel for the whole theme surface.
- **Lib helpers** (`src/lib/`): `haptics.ts` (semantic wrapper, fire-and-forget),
  `id.ts` (`newId()` via `expo-crypto.randomUUID()`), `strings.ts` (central copy),
  `logger.ts` (thin logger), `index.ts` barrel.
- **Primitives** (`src/ui/primitives/`): `Icon`, `Text`, `Surface`, `Pressable`, `Button`,
  `IconButton`, `Chip`, `FAB`, `TextField`, `EmptyState` + `index.ts` barrel. Each obeys
  ui-rules.md: tokens only, press motion + haptics (via `Pressable`), ≥48dp targets,
  reduced-motion, a11y roles/labels/states. Registry statuses flipped to 🟢.
- **Kitchen-sink** (`src/app/kitchen-sink.tsx`): throwaway `/kitchen-sink` route rendering
  every primitive; follows the OS color scheme.

## Key files added/changed
- `src/theme/habitColors.ts` — per-habit tonal palettes + lookup.
- `src/theme/motion.ts` — spring/timing presets + `useMotion()` reduced-motion hook.
- `src/theme/colors.ts` — full-parity JS color mirror (extended).
- `src/theme/tokens.ts` — added `z` + `shadow` tokens (extended).
- `src/theme/index.ts` — theme barrel (new).
- `src/lib/{haptics,id,logger,strings,index}.ts` — semantic helpers (new).
- `src/ui/primitives/{Icon,Text,Surface,Pressable,Button,IconButton,Chip,FAB,TextField,EmptyState,index}.tsx`
  — the primitive set (new).
- `src/app/kitchen-sink.tsx` — throwaway eyeball screen (new).
- `docs/ui-registry.md` — added `Icon`, flipped built primitives to 🟢, recorded the icon-set
  decision. `docs/ui-tokens.md` §5 — noted the concrete shadow tokens.
- `package.json` — added `expo-crypto@~57.0.1`, `@expo/vector-icons@^15.1.1` (via
  `expo install`). Removed empty leftover `src/components`, `src/constants` dirs.

## Decisions made (and why)
- **Icon set = `@expo/vector-icons` → `MaterialCommunityIcons`** (asked & confirmed with the
  user). Works iOS/Android/web with a typed glyph union; `expo-symbols`/SF Symbols stay for
  native-tab icons only. Recorded in ui-registry.md.
- **IDs via `expo-crypto.randomUUID()`, not the npm `uuid` package.** The installed `uuid`
  resolves to a build that `require("crypto").randomBytes` — Node-only, absent in the RN
  runtime without a polyfill. `expo-crypto` is the RN-safe Expo path. (See gotcha below.)
- **Shared values use `.get()`/`.set()`, never `.value =`.** The project has
  `reactCompiler: true`; the new `react-hooks/immutability` lint rule flags `.value =` on
  reanimated shared values. `.get()/.set()` is reanimated's own React-Compiler-safe API
  (verified via Context7 against the reanimated docs). Applied in `Pressable`, `Chip`,
  `TextField`.
- **Animated wrapper carries only the transform; visual styling stays on children via
  `className`.** Avoids leaning on className-on-animated-component cssInterop, the fragile
  path. `Pressable` merges a caller `style` (e.g. `borderRadius`) under its animated style.
- **Kitchen-sink follows OS scheme only** (asked & confirmed) — no throwaway in-app toggle.

## Gotchas / things the next agent must know
- **`react-hooks/immutability` + reanimated:** with the React Compiler on, `sharedValue.value
  = x` is a lint error. Use `sv.get()` / `sv.set(x)` (works inside and outside worklets).
  `useDerivedValue` returns a read value — read it with `.get()` too.
- **Don't reach for npm `uuid` in RN** — it needs `crypto`. Use `newId()` (`expo-crypto`).
- **`useReducedMotion()` is a snapshot** taken at app start (verified in reanimated 4.5.0
  source) — it does not re-render on a live setting change. Fine for our use; just know a
  mid-session toggle won't re-animate until reload.
- **`Icon` color:** vector-icons take a `color` *string*, not a className, so `Icon` resolves
  the role via `useTheme()`. For on-accent icons (habit accent) pass `colorValue` (raw).
- **`transformOrigin`** (used in `TextField` label) is supported in RN 0.86 — verified in the
  installed `StyleSheetTypes.d.ts`.
- **Palette hexes are still provisional** (ui-tokens §1.2 note) — the habit-palette hexes in
  `habitColors.ts` are M3-structured, AA-intended defaults; regenerate alongside the accent
  when the source color is finalized (open question, below).

## What is NOT done yet (deferred)
- **No live on-device/simulator visual proof.** tsc + lint + doctor + a successful iOS
  *export bundle* confirm it builds and will run, but the actual light/dark pixel check and
  the reduced-motion path have **not** been eyeballed on a device. Run `/kitchen-sink` on a
  simulator (and toggle Reduce Motion + Appearance) for visual sign-off. Same caveat class as
  Phase 0's deferred dark-flip screenshot.
- **`ProgressRing`, `Sheet`/`Modal`** primitives remain 🟡 (spec'd, not built) — they belong
  to later phases (Today / add-edit) and aren't Phase 1 deliverables.
- **Habit-specific components** (`CheckControl`, `HabitCard`, pickers, etc.) are Phase 4/5/6.
- **`kitchen-sink.tsx` is throwaway** — delete once real feature screens exist.
- No unit tests yet (`jest`/`jest-expo` land in Phase 2 with the domain logic); primitives
  are verified by typecheck/lint/bundle only.

## Next phase
- **Phase 2 — Data layer** ([build-plan.md](../build-plan.md) §Phase 2): build
  `src/db/schema.ts` per [architecture.md](../architecture.md) §4, `drizzle.config.ts`
  (driver `expo`) + initial migration, `src/db/client.ts` with change listeners and the
  `useMigrations` gate. Then the **pure, test-first domain**: `cadence.ts` (`isScheduledOn`),
  `streak.ts` (`computeStreak`), `stats.ts` — each with unit tests covering the §7 edge cases
  (today-grace, weekday skips, ISO weekly weeks, DST/travel) — followed by `src/data/habits.ts`
  and `src/data/checkins.ts`. First install `jest`/`jest-expo`.
