# Library Docs & Setup — Happit

> The exact dependencies, why each is here, and the **precise** config each one needs.
> Setup snippets below are verified against current (SDK 54–era) docs. When you touch a
> dependency, update this file. Anything not listed here should not be added without a
> reason recorded in [architecture.md](./architecture.md).

> ⚠️ **Pin versions when you install.** Run the install commands, then write the resolved
> versions into the "Version" column so future work is reproducible. Prefer
> `npx expo install` for anything Expo-managed — it picks SDK-compatible versions.

---

## 1. Dependency list

| Package | Purpose | Version (fill in) |
| --- | --- | --- |
| `expo` | Framework (SDK 54) | `__` |
| `expo-router` | File-based navigation, typed routes | `__` |
| `react-native-safe-area-context` | Safe areas (peer of router) | `__` |
| `react-native-screens` | Native screens (peer of router) | `__` |
| `nativewind` | Tailwind styling for RN | `4.x` |
| `tailwindcss` | Tailwind engine (NativeWind v4 peer) | `3.4.x` |
| `expo-sqlite` | On-device SQL database | `__` |
| `drizzle-orm` | Type-safe ORM + `useLiveQuery` | `__` |
| `drizzle-kit` (dev) | Migration generator | `__` |
| `react-native-reanimated` | Spring/morph animations | `~4.x` |
| `react-native-gesture-handler` | Gestures (reorder, press) | `__` |
| `expo-haptics` | Haptic feedback tokens | `__` |
| `date-fns` | Date math | `__` |
| `zustand` | Preference state | `__` |
| `babel-plugin-module-resolver` (dev) | `@/` path alias | `__` |
| `jest-expo`, `jest` (dev) | Testing | `__` |
| `eslint-config-expo`, `prettier` (dev) | Lint/format | `__` |

Optional / on-demand: `date-fns-tz` (only if a real tz need appears), `drizzle-studio-expo`
(dev DB inspector).

Install (Expo picks compatible versions):
```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-sqlite react-native-reanimated react-native-gesture-handler expo-haptics
npm i nativewind zustand date-fns drizzle-orm
npm i -D tailwindcss@3 drizzle-kit babel-plugin-module-resolver jest-expo prettier eslint-config-expo
```

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
  darkMode: 'class', // required; we flip via StyleSheet flag / theme switch
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
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

**`babel.config.js`**
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      ['module-resolver', { alias: { '@': './src' } }],
      'react-native-reanimated/plugin', // MUST be last
    ],
  };
};
```

**`metro.config.js`**
```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

**`app.json`** — web bundler must be `metro` if web ever runs; import `global.css` once in
the root layout (`import '../global.css'`).

> Gotchas: `reanimated/plugin` must be the **last** babel plugin. After changing any of
> these four files, restart Metro with `--clear`. If `className` "does nothing", it's
> almost always a missing preset, wrong content glob, or stale cache.

## 4. expo-sqlite + Drizzle ORM

**Client (open once, change listeners on):**
```ts
// src/db/client.ts
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

export const expo = openDatabaseSync('happit.db', { enableChangeListener: true });
export const db = drizzle(expo, { schema });
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
npx drizzle-kit generate
```
This emits SQL + a `migrations.js` bundle in `src/db/migrations/`. **Never hand-edit
generated files.** Requires the metro/babel setup to import the generated JS bundle
(inlineRequires / the drizzle expo migrations import work out of the box with
`babel-preset-expo`).

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
- `react-native-reanimated/plugin` is the **last** babel plugin (see §3).
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

## 9. Versions / upgrade policy

- Upgrades go through `npx expo install --check` / `npx expo-doctor`. Don't bump a native
  dep independently of the SDK.
- When any version here changes, update the table in §1 and re-verify the affected setup
  snippet against current docs (use Context7 for the library).
