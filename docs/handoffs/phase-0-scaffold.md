# Phase 0 Handoff — Scaffold & Tooling

**Status:** ✅ complete · **Date:** 2026-07-22
**Verified by:** `tsc --noEmit` clean · iOS bundle builds (1596 modules) · `expo-doctor`
20/20 · `expo lint` clean.

## What this phase delivered
- A stripped, clean Expo **SDK 57** app (React 19.2, RN 0.86, Reanimated 4.5) with the demo
  starter removed.
- **NativeWind v4** styling wired end-to-end (Tailwind v3), driven by Material 3 token CSS
  variables with working light/dark switching.
- The **route skeleton** under `src/app/`: three native bottom tabs (Today / Habits /
  Settings) plus `habit/[id]` (push) and `habit/new` (modal).
- A **theme module** (`src/theme/`) mirroring the design tokens.
- Docs reconciled to the real project (SDK 57, `src/app/` routing, bun, tsconfig alias).

Maps to build-plan Phase 0 tasks — all checked in
[../progress-tracker.md](../progress-tracker.md).

## Key files added/changed
- `tailwind.config.js` — `darkMode: 'class'`, `content: ./src/**`, M3 color roles → CSS
  vars, shape scale.
- `metro.config.js` — `withNativeWind(config, { input: './src/global.css' })` +
  `isTsconfigPathsEnabled: true`.
- `babel.config.js` — `babel-preset-expo` (`jsxImportSource: 'nativewind'`) +
  `nativewind/babel`; **`react-native-worklets/plugin` last**.
- `src/global.css` — `@tailwind` directives + full light/`.dark` M3 token variables.
- `nativewind-env.d.ts` — `nativewind/types` reference + `declare module '*.css'`.
- `src/theme/tokens.ts` (spacing/radius/motion), `colors.ts` (JS color mirror),
  `useTheme.ts` (scheme + colors via `nativewind`'s `useColorScheme`).
- `src/app/_layout.tsx` (GestureHandlerRoot + `import '@/global.css'` + Stack),
  `src/app/(tabs)/_layout.tsx` (NativeTabs), `(tabs)/{index,habits,settings}.tsx`,
  `habit/[id].tsx`, `habit/new.tsx`.
- `package.json` — removed `@expo/ui`, `expo-glass-effect`, `reset-project` script; added
  nativewind, tailwindcss, drizzle-orm, drizzle-kit, expo-sqlite, expo-haptics, date-fns,
  zustand, prettier (and eslint on first lint run).

## Decisions made (and why)
- **Clean slate** over adapting the starter — avoids two styling systems fighting.
- **Custom NativeWind M3**, not `@expo/ui`/glass — full control over the Expressive look;
  the native/glass deps were **removed**. `expo-symbols` kept only for native-tab icons.
- **Match the repo's tooling:** use **bun** and the existing `tsconfig` `@/*` paths (+ metro
  `isTsconfigPathsEnabled`); **no** `babel-plugin-module-resolver`. Docs updated to match.
- **NativeWind pinned to v4** (`^4.1.23` → 4.2.6) — v5 is still preview.

## Gotchas / things the next agent must know
- **Reanimated 4 babel plugin is `react-native-worklets/plugin`**, NOT
  `react-native-reanimated/plugin` (v3). Verified from installed `react-native-worklets`
  source. It must be the **last** babel plugin.
- **opensrc cache can be mislabeled:** the `nativewind` clone was tagged `4.2.6` in
  `opensrc list` but checked out on the **v5 preview branch**. When the tag isn't found,
  opensrc clones the default branch — so for version-critical APIs, verify against the
  actually-installed `node_modules`, not just the opensrc path. (This is why AGENTS.md says
  to verify the resolved version.)
- **Routes live in `src/app/`** — Expo Router auto-detects it over a top-level `app/`.
- **NativeTabs** (`expo-router/unstable-native-tabs`) Icon supports `sf` (iOS) + `md`
  (Android) — no icon asset files needed. Path is still `unstable-native-tabs`.
- `app.json` has `experiments.reactCompiler: true` and `typedRoutes: true`;
  `babel-preset-expo` handles the compiler automatically.
- After editing any of the four NativeWind config files, restart Metro with `--clear`.

## What is NOT done yet (deferred)
- **No live on-device screenshot** of the dark-mode flip — only bundle + doctor + typecheck
  confirm it will run. Run on a simulator/device if visual proof is wanted.
- **No DB yet** — `src/db/`, schema, migrations, and the domain logic are Phase 2.
- **No real UI primitives** — screens are placeholder skeletons; `src/ui/` is empty.
- `jest`/`jest-expo` not installed yet (Phase 2, when domain tests start).
- Per-habit color palettes (`src/theme/habitColors.ts`) not created yet (Phase 1).

## Next phase
- **Phase 1 — Design system foundation** ([../build-plan.md](../build-plan.md) §Phase 1):
  build `src/theme` out fully (habitColors, motion presets, reduced-motion), the semantic
  `haptics`/`id`/`strings` libs, and the primitives (`Text`, `Surface`, `Pressable`,
  `Button`, `IconButton`, `Chip`, `FAB`, `TextField`, `EmptyState`) per
  [../ui-registry.md](../ui-registry.md) — plus a kitchen-sink screen to eyeball them in
  light/dark. Flip registry statuses to 🟢 as they land.
