# Library Docs & Setup — Happit

> The exact dependencies, why each is here, and the **precise** config each one needs.
> This project is **Expo SDK 57** (React 19.2, RN 0.86). `package.json` is the source of
> truth for versions. When you touch a dependency, update this file. Anything not listed
> here should not be added without a reason recorded in [architecture.md](./architecture.md).

> ⚠️ **Read the real API from `opensrc` before wiring any library** (see
> [../AGENTS.md](../AGENTS.md)) — do not trust training recall. Prefer `npx expo install`
> for Expo-managed packages so they stay SDK-57-compatible.

---

## 1. Dependency list

### 1a. Already installed (in `package.json`)

| Package | Version | Purpose / keep? |
| --- | --- | --- |
| `expo` | ~57.0.8 | Framework (SDK 57) — keep |
| `expo-router` | ~57.0.8 | File-based navigation, typed routes — keep |
| `expo-constants` | ~57.0.7 | keep |
| `expo-linking` | ~57.0.4 | deep links — keep |
| `expo-splash-screen` | ~57.0.5 | keep |
| `expo-status-bar` | ~57.0.1 | keep |
| `expo-system-ui` | ~57.0.1 | keep |
| `expo-font` | ~57.0.1 | keep (custom/display fonts later) |
| `expo-device` | ~57.0.1 | keep (mid-range perf checks) |
| `expo-web-browser` | ~57.0.2 | keep only if used (about/links) |
| `react` / `react-dom` | 19.2.3 | keep |
| `react-native` | 0.86.0 | keep |
| `react-native-reanimated` | 4.5.0 | Expressive motion — keep |
| `react-native-worklets` | 0.10.0 | reanimated 4 worklet runtime — keep |
| `react-native-gesture-handler` | ~2.32.0 | gestures (reorder, press) — keep |
| `react-native-safe-area-context` | ~5.7.0 | safe areas — keep |
| `react-native-screens` | ~4.26.0 | native screens — keep |
| `react-native-web` | ~0.21.0 | present; web is **not** a supported target |
| `@expo/ui` | ~57.0.7 | ❌ **remove** — native UI, not our custom-M3 plan |
| `expo-glass-effect` | ~57.0.1 | ❌ **remove** — liquid-glass, not our plan |
| `expo-image` | ~57.0.1 | keep only if we need remote/optimized images (unlikely v1) |
| `expo-symbols` | ~57.0.1 | keep **only** for native-tab SF Symbols; not for content UI |
| `typescript` | ~6.0.3 | keep |
| `@types/react` | ~19.2.2 | keep |

> `react-native-reanimated@4` requires `react-native-worklets` (already present) and its
> babel plugin is now `react-native-worklets/plugin` — verify against opensrc when wiring.

### 1b. To add (per the plan)

> **This repo uses `bun`** (`bun.lock`). Use `bun add` / `bunx expo install`, not npm.
> The `@/*` alias is already in `tsconfig.json` (+ metro `isTsconfigPathsEnabled`), so
> **no** `babel-plugin-module-resolver` is needed. Most of the row below is **already
> installed** (Phase 0).

| Package | Version | Purpose | Status |
| --- | --- | --- | --- |
| `nativewind` | 4.2.6 | Tailwind styling for RN | ✅ installed |
| `tailwindcss` | 3.4.19 | NativeWind v4 peer | ✅ installed |
| `expo-sqlite` | 57.0.1 | On-device SQL DB | ✅ installed |
| `drizzle-orm` | 0.45.2 | ORM + `useLiveQuery` | ✅ installed |
| `drizzle-kit` (dev) | 0.31.10 | Migration generator | ✅ installed |
| `expo-haptics` | 57.0.1 | Haptic tokens | ✅ installed |
| `date-fns` | 4.4.0 | Date math | ✅ installed |
| `zustand` | 5.0.14 | Preference state | ✅ installed |
| `prettier` (dev) | 3.9.6 | Format (`expo lint` already wired) | ✅ installed |
| `jest` (dev) | 29.7.0 | Test runner (**pinned v29** — jest-expo 57 is built for jest 29) | ✅ installed (Phase 2) |
| `jest-expo` (dev) | 57.0.2 | Expo jest preset; domain tests use its `node` preset | ✅ installed (Phase 2) |
| `@types/jest` (dev) | 29.x | jest global types (`describe`/`it`/`expect`) for tsc | ✅ installed (Phase 2) |
| `babel-plugin-inline-import` (dev) | 3.0.0 | Inline `.sql` migrations as strings for drizzle's Expo migrator | ✅ installed (Phase 2) |
| `react-native-draggable-flatlist` | 4.0.3 | Drag-to-reorder Habits list (persist `sortOrder`) | ✅ installed (Phase 4) — see §10 |

Install commands used (for reference):
```bash
bun add nativewind@^4.1.23 tailwindcss@^3.4.17 drizzle-orm date-fns zustand
bunx expo install expo-sqlite expo-haptics
bun add -d drizzle-kit prettier
# Phase 2:
bun add -d babel-plugin-inline-import jest@^29.7.0 jest-expo @types/jest@^29
```

> ⚠️ **Pin jest to v29.** `jest-expo@57` peers on jest **29** (its deps are `^29.2.1`).
> Installing jest **30** breaks with `this._moduleMocker.clearMocksOnScope is not a function`
> at runtime — verified. Keep `jest` + `@types/jest` on `^29`.

Optional / on-demand: `date-fns-tz` (only if a real tz need appears), `drizzle-studio-expo`
(dev DB inspector).

> **Cached in opensrc at project versions:** `expo@57.0.8`, `expo-sqlite@57.0.1`,
> `expo-haptics@57.0.1`, `nativewind@4.2.6`, `zustand@5.0.14`, `drizzle-orm@0.45.2`,
> `drizzle-kit@0.31.10`, `date-fns` (GitHub main). Read their real API from source before
> use. (Some Expo/RN modules were still being fetched at doc-time — run `opensrc fetch`
> as needed.)

---

## 2. Expo Router

- Enable **typed routes** in `app.json`:
  ```json
  { "expo": { "experiments": { "typedRoutes": true } } }
  ```
- Entry point is `expo-router/entry` (Expo default). Routes live in `app/` only (see
  [architecture.md](./architecture.md) §3, §6).
- **Native bottom tabs** via `expo-router/unstable-native-tabs`:
  ```tsx
  // app/(tabs)/_layout.tsx
  import { NativeTabs } from 'expo-router/unstable-native-tabs';

  export default function TabLayout() {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="checkmark.circle" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="habits">
          <NativeTabs.Trigger.Label>Habits</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="list.bullet" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="gearshape" />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }
  ```
  > `NativeTabs` is currently under the `unstable-native-tabs` path. If it moves/stabilizes,
  > update this snippet. Android uses drawable/vector icons; iOS uses SF Symbols (`sf`).
- Detail push + modal: a `Stack` in the relevant layout; `app/habit/new.tsx` presented as a
  modal via `options={{ presentation: 'modal' }}`.

## 3. NativeWind v4 + Tailwind

Four files must all be correct or styles silently don't apply.

**`tailwind.config.js`**
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // required; we flip via the theme switch (useColorScheme)
  content: ['./src/**/*.{js,jsx,ts,tsx}'], // routes live in src/app, code in src/*
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // map token CSS variables → tailwind color names
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        surface: 'var(--surface)',
        'on-surface': 'var(--on-surface)',
        // …mirror every role from ui-tokens.md §1
      },
      borderRadius: { /* mirror radius scale from ui-tokens.md §3 */ },
      spacing: { /* mirror space scale from ui-tokens.md §4 */ },
    },
  },
  plugins: [],
};
```

**`global.css`** — the token variables (light + `.dark`) from
[ui-tokens.md](./ui-tokens.md) §1.2, plus:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`babel.config.js`** — no `module-resolver`; the `@/*` alias is handled by `tsconfig.json`
paths + metro's `isTsconfigPathsEnabled`.
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      'react-native-worklets/plugin', // MUST be last (Reanimated 4 — verified from source)
    ],
  };
};
```
> **Reanimated 4 note:** the babel plugin moved from `react-native-reanimated/plugin` to
> **`react-native-worklets/plugin`** (verified against the installed
> `react-native-worklets@0.10.0` source — it publishes `plugin/index.js`). Use the worklets
> path; the old reanimated path is for v3. `babel-preset-expo` also picks up
> `experiments.reactCompiler: true` from app.json automatically — no extra plugin needed.

**`metro.config.js`**
```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// isTsconfigPathsEnabled honors the `@/*` alias from tsconfig.json.
const config = getDefaultConfig(__dirname, { isTsconfigPathsEnabled: true });
module.exports = withNativeWind(config, { input: './src/global.css' });
```

**CSS entry** — `src/global.css` holds the `@tailwind` directives + token variables; it is
imported once as a side-effect in `src/app/_layout.tsx` (`import '@/global.css'`). A
`declare module '*.css';` in `nativewind-env.d.ts` satisfies the TS side-effect import.

> Gotchas: `react-native-worklets/plugin` must be the **last** babel plugin. After changing
> any of these four files, restart Metro with `--clear`. If `className` "does nothing", it's
> almost always a missing preset, wrong content glob, or stale cache.

## 4. expo-sqlite + Drizzle ORM

**Client (open once, change listeners on):**
```ts
// src/db/client.ts
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

export const expoDb = openDatabaseSync('happit.db', { enableChangeListener: true });
export const db = drizzle(expoDb, { schema });
```
> `enableChangeListener: true` is **required** for `useLiveQuery` to re-render on writes.

**Schema:** single source in `src/db/schema.ts` — see
[architecture.md](./architecture.md) §4 for the full definition.

**`drizzle.config.ts`** (driver `expo` is essential):
```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'expo', // <-- required for Expo SQLite migration generation
});
```

**Generate migrations:**
```bash
bunx drizzle-kit generate
```
This emits SQL + a `migrations.js` bundle in `src/db/migrations/`. **Never hand-edit
generated files.**

**Metro + Babel wiring for the `.sql` import (required — NOT out of the box).** The generated
`migrations.js` does `import m0000 from './0000_*.sql'`, so Metro must resolve `.sql` and
Babel must inline it as a string. Verified against the drizzle Expo docs + our SDK-57 build:
```js
// metro.config.js
config.resolver.sourceExts.push('sql');
```
```js
// babel.config.js — BEFORE react-native-worklets/plugin (which must stay last)
plugins: [
  ['babel-plugin-inline-import', { extensions: ['.sql'] }],
  'react-native-worklets/plugin',
]
```
```ts
// src/db/sql.d.ts — so tsc accepts the .sql import under strict
declare module '*.sql' { const content: string; export default content; }
```
> Without `babel-plugin-inline-import` + `sourceExts`, migrations fail to bundle at runtime.

**Gate the UI at boot** with `MigrationGate` (`src/db/MigrationGate.tsx`) — runs
`useMigrations`, shows an `EmptyState` loading screen while `!success`, a recoverable error
screen on `error`, and renders children on success (architecture.md §8). Composed in
`src/app/_layout.tsx` right under `GestureHandlerRootView`.

**Apply at boot (gates the UI):**
```ts
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/db/migrations/migrations';
import { db } from '@/db/client';

const { success, error } = useMigrations(db, migrations);
```

**Reactive reads:**
```ts
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
const { data } = useLiveQuery(db.select().from(habits));
```

**Inspect the DB in dev:** `expo-sqlite` has a built-in DevTools inspector; optionally add
`drizzle-studio-expo` for Drizzle Studio.

## 5. Reanimated + Gesture Handler

- `react-native-gesture-handler` must be imported at the very top of the app entry, and the
  app wrapped in `<GestureHandlerRootView style={{ flex: 1 }}>` (in root `_layout.tsx`).
- `react-native-worklets/plugin` is the **last** babel plugin (Reanimated 4 — see §3).
- All motion presets (springs/timings) live in `src/theme/motion.ts` mirroring
  [ui-tokens.md](./ui-tokens.md) §6. Components import presets; no inline configs.
- Honor reduced motion via `useReducedMotion()` from reanimated.

## 6. expo-haptics

Wrapped in `src/lib/haptics.ts` exposing the semantic tokens from
[ui-tokens.md](./ui-tokens.md) §7. Components call `haptics.check()`, never `expo-haptics`
directly.

## 7. date-fns

- Day-level logic uses `format(date, 'yyyy-MM-dd')` and string comparison.
- `getDay` returns 0=Sun..6=Sat — matches the `weekdays` numbering in
  [architecture.md](./architecture.md) §7.2.
- ISO week helpers (`startOfISOWeek`, `getISOWeek`) for `weekly_count` streaks.
- Import per-function for tree-shaking: `import { format } from 'date-fns'`.

## 8. zustand

- Preference stores only (theme mode, accent key, week-start). Persist via
  `persist` middleware. Keep stores tiny and flat. See
  [code-standards.md](./code-standards.md) §6.

## 10. react-native-draggable-flatlist (reorder) + ReanimatedSwipeable (archive)

**Reorder — `react-native-draggable-flatlist@4.0.3`.** Verified against the *installed*
Reanimated 4.5.0 + gesture-handler 2.32 source before wiring (AGENTS opensrc-first rule):

- Its peer range says `reanimated >=2.8.0`, but 4.0.3 uses the **modern gesture API**
  (`Gesture` / `GestureDetector` from `react-native-gesture-handler`, **not** the deprecated
  `PanGestureHandler` component) and only imports reanimated symbols that still exist in 4.5:
  `runOnJS`, `useAnimatedReaction`, `useAnimatedScrollHandler`, `useSharedValue`,
  `useDerivedValue`, `withSpring`, `SharedValue`, `WithSpringConfig` — all confirmed present
  in `node_modules/react-native-reanimated@4.5.0`. The one v1-era reference is the
  `PanGestureHandlerProperties` **type** (for a `hitSlop` prop) — still exported by gh 2.32.
  So it runs on our stack despite its age.
- **API (from `lib/typescript`):** default export `DraggableFlatList`; props `data`,
  `keyExtractor`, `renderItem: ({ item, drag, isActive }) => ReactNode`,
  `onDragEnd: ({ data, from, to }) => void`. `ScaleDecorator` (+ `ShadowDecorator`,
  `OpacityDecorator`) from the package root wrap the row for the lift animation.
- **Wiring:** `onDragEnd` gives the reordered `data` array → map to ids → persist with
  `reorderHabits(ids)` (writes each row's `sortOrder`). It renders inside the
  `GestureHandlerRootView` already in the root layout.

**Archive — `ReanimatedSwipeable` (ships with gesture-handler).** Import from the subpath
`react-native-gesture-handler/ReanimatedSwipeable` (a folder barrel — the root `index` only
re-exports the *legacy* `Swipeable`; the Reanimated-4-compatible one is the subpath):
```ts
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
```
- **API (from source):** `renderRightActions(progress, translation, methods)` returns the
  revealed action; `onSwipeableOpen(direction)` fires when opened; `rightThreshold`,
  `friction` tune it; `ref` exposes `SwipeableMethods.close()` to snap shut after acting.
- Swipe a row → reveal an Archive action → confirm → `archiveHabit(id)`; archived habits
  drop out of `useHabits` (it filters `archivedAt IS NULL`). No archived-habits view in v1.

> Both were chosen with the user; the age of draggable-flatlist is a known risk, mitigated by
> the source verification above. If a future SDK bump breaks it, the fallback is a bare
> gesture-handler + reanimated reorder (no new dep).

## 9. Versions / upgrade policy

- Upgrades go through `npx expo install --check` / `npx expo-doctor`. Don't bump a native
  dep independently of the SDK.
- When any version here changes, update the table in §1 and re-verify the affected setup
  snippet against current docs (use Context7 for the library).
