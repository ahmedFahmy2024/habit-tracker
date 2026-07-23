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
| `react-native-svg` | 15.15.4 | SVG stroke-draw for `CheckControl` check + `ProgressRing` (Today) | ✅ installed (Phase 5) — see §11 |
| `expo-file-system` | 57.0.1 | Write/read the export JSON file (new `File`/`Paths` API) | ✅ installed (Phase 7) — see §12 |
| `expo-sharing` | 57.0.7 | OS share sheet to deliver the export file | ✅ installed (Phase 7) — see §12 |
| `expo-document-picker` | 57.0.1 | Pick a backup JSON file to import | ✅ installed (Phase 7) — see §12 |
| `expo-notifications` | 57.0.7 | Local reminders (scheduled, no push server) | ✅ installed (Phase 9) — see §13 |
| `@react-native-community/datetimepicker` | 9.1.0 | Native time picker for the reminder time | ✅ installed (Phase 9) — see §13 |
| `react-native-android-widget` | 0.21.0 | Native **Android** home-screen widget (config plugin + JS-rendered RemoteViews) | ✅ installed (Phase 10) — see §14. iOS WidgetKit deferred. |

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

- Preference stores only (theme mode, accent key, week-start). Keep stores tiny and flat.
  See [code-standards.md](./code-standards.md) §6.
- **Persistence (decided Phase 7): a `key_value` table in the same `happit.db`, not the
  `persist` middleware / AsyncStorage.** Reason: we already own a synchronous sqlite
  connection (`expoDb`), so the store hydrates **synchronously at module load** via
  `getFirstSync` — the value is present on the very first render, so there is **no theme
  flash** on cold start (the `persist` middleware rehydrates async, which needs a
  `hasHydrated` gate to avoid a light→dark flash). Setters write-through synchronously with
  `runSync`. No new dependency. The `key_value` table is created by migration `0001`.
  Store lives in `src/store/preferences.ts`.

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

## 11. react-native-svg (Today: CheckControl check-draw + ProgressRing) — Phase 5

Installed with `bunx expo install react-native-svg` → **`15.15.4`** (the SDK-57-compatible
pin). Chosen (with the user) over an SVG-free approach so both the CheckControl's animated
checkmark and the ProgressRing render as **true stroke-draws** (`strokeDashoffset`), which is
the more Expressive result than a View-clip arc.

- **Exports (from `node_modules/react-native-svg/lib/typescript`):** the default export is
  `Svg`; `Circle` and `Path` come from the package root (via `./elements`). `CircleProps` /
  `PathProps` both extend `CommonPathProps`, which includes `strokeDasharray`,
  `strokeDashoffset`, `strokeLinecap`, `strokeWidth`, `stroke`, `fill` — all verified in
  `lib/extract/types.d.ts`. `Circle`/`Path` are classes (`extends Shape<…>`), so they wrap
  cleanly with `Animated.createAnimatedComponent`.
- **Animating the draw (reanimated 4.5):** `useAnimatedProps` **is** present in 4.5
  (`hook/useAnimatedProps.d.ts`). Pattern:
  ```ts
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const props = useAnimatedProps(() => ({ strokeDashoffset: offset.get() }));
  // <AnimatedCircle animatedProps={props} strokeDasharray={C} … />
  ```
  A full-length `strokeDasharray` (= the circle circumference / the path length) with an
  animated `strokeDashoffset` from `len → 0` draws the stroke on. Same technique for the
  ProgressRing circle and the CheckControl check `Path`.
- **Reduced motion:** skip the offset animation and set the final `strokeDashoffset` (0 for
  fully drawn) directly, per ui-rules §1.5.
- **No extra config.** react-native-svg autolinks under Expo; no metro/babel change. Renders
  inside the existing `GestureHandlerRootView` app tree. (Path lengths are computed as plain
  geometry constants, not measured, to keep the worklet pure.)

## 12. Settings & data safety (Phase 7): file-system + sharing + document-picker

Installed with `bunx expo install expo-file-system expo-sharing expo-document-picker` →
`57.0.1 / 57.0.7 / 57.0.1`. **APIs verified against the installed `node_modules` source**
(the SDK-54+ `expo-file-system` rewrite — the old `writeAsStringAsync`/`documentDirectory`
functions are the deprecated *legacy* subpath; the current API is class-based):

- **`expo-file-system` — `File` / `Paths` (from `build/File.d.ts`, `build/Paths.d.ts`,
  `build/internal/NativeFileSystem.types.d.ts`):**
  ```ts
  import { File, Paths } from 'expo-file-system';
  const file = new File(Paths.cache, 'happit-backup-YYYY-MM-DD.json');
  file.create({ overwrite: true }); // FileCreateOptions
  file.write(jsonString);           // write(content: string | Uint8Array)
  const text = file.textSync();     // sync read; async `text()` also exists
  file.exists; file.delete(); file.uri; // fields/methods on the base class
  ```
  `Paths.cache` / `Paths.document` are `Directory` getters. The `File` constructor joins its
  args into a URI and does **not** require the file to exist yet.
- **`expo-sharing` (from `build/Sharing.d.ts`):** `isAvailableAsync(): Promise<boolean>` +
  `shareAsync(url: string, options?)`. Pass the file's `uri`. Guard with `isAvailableAsync`
  first (share sheet is unavailable on some platforms/simulators).
- **`expo-document-picker` (from `build/index.d.ts` + `build/types.d.ts`):**
  `getDocumentAsync({ type, copyToCacheDirectory, multiple })` → a discriminated
  `DocumentPickerResult`: `{ canceled: true, assets: null }` or
  `{ canceled: false, assets: [{ uri, name, size?, mimeType? }] }`. We read the picked file
  by `new File(asset.uri).text()`. `type: 'application/json'`, `copyToCacheDirectory: true`.

Config plugin `expo-sharing` was auto-added to `app.json` by `expo install`. No other config
needed; all three autolink under Expo. The export/import layer lives in `src/data/backup.ts`
(thin wrappers; the Settings route stays thin per architecture §3).

## 13. Local reminders (Phase 9): expo-notifications ✅

Installed with `bunx expo install expo-notifications @react-native-community/datetimepicker`
→ **`expo-notifications@57.0.7`** + **`@react-native-community/datetimepicker@9.1.0`**. APIs
verified against the **installed** `node_modules`/opensrc source before wiring. Wrapped in
`src/lib/notifications.ts` — components/screens never import `expo-notifications` directly
(mirrors `src/lib/haptics.ts`). No push token, no `getExpoPushTokenAsync`, no `projectId`:
reminders are **local only** and work in airplane mode.

> ### ⚠️ Two corrections to the original plan (verified on-device SDK 57)
>
> **(1) Trigger = WEEKLY, not CALENDAR.** The CALENDAR trigger sketched below is **iOS-only**:
> the installed Android source (`android/.../scheduling/NotificationScheduler.kt::triggerFromParams`)
> has `else -> throw InvalidArgumentException("Trigger of type: calendar is not supported on
> Android")`. Use **`SchedulableTriggerInputTypes.WEEKLY`** (`{ type, weekday, hour, minute,
> channelId }`), which Android maps via `Calendar.DAY_OF_WEEK`. **Weekday is 1=Sun…7=Sat**
> (`Calendar.SUNDAY == 1`; also documented on `WeeklyTriggerInput`), so convert our domain Weekday
> (0=Sun..6=Sat) with **`weekday + 1`**. Schedule one WEEKLY notification per scheduled weekday.
>
> **(2) Not usable in Expo Go — needs a dev build.** In SDK 53+ expo-notifications was removed from
> Expo Go: on Android its `TokenEmitter` calls `warnOfExpoGoPushUsage()` at **module scope**, which
> `throw`s, so `import * as Notifications from "expo-notifications"` **red-boxes the whole app in Expo
> Go**. `@react-native-community/datetimepicker` similarly does `TurboModuleRegistry.getEnforcing` at
> module scope (its native module isn't in the Expo Go binary). **Both are therefore lazy-loaded via
> `require()` behind `isRunningInExpoGo()` from `expo`** (`getNotifications()` / `getPicker()`), so the
> app runs fully in Expo Go with reminders inert and a clear "Unavailable in Expo Go" state. Verify
> actual firing/cancel/reschedule in a **dev build**.

Key surface (SDK 57), verified from the installed source:

- **Handler (module scope, once):** the modern fields are `shouldShowBanner` +
  `shouldShowList` (the old `shouldShowAlert` is deprecated). Handler must resolve within 3s.
  ```ts
  import * as Notifications from 'expo-notifications';
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  ```
- **Permissions:** `getPermissionsAsync()` → if not granted, `requestPermissionsAsync({ ios: {
  allowAlert: true, allowBadge: true, allowSound: true } })`. Surface a denied state in Settings.
- **Android channel** (required for the prompt + delivery):
  `Notifications.setNotificationChannelAsync('reminders', { name: 'Reminders',
  importance: Notifications.AndroidImportance.DEFAULT })`.
- **Schedule a repeating weekday reminder** — one **WEEKLY** trigger per scheduled weekday:
  ```ts
  await N.scheduleNotificationAsync({
    content: { title: habit.name, body: 'Still unchecked today…', data: { habitId } },
    trigger: {
      type: N.SchedulableTriggerInputTypes.WEEKLY,
      weekday: domainWeekday + 1,   // 0=Sun..6=Sat → 1=Sun..7=Sat (Android Calendar.DAY_OF_WEEK)
      hour, minute,
      channelId: 'reminders',
    },
  });
  ```
  (`SchedulableTriggerInputTypes` also has `DAILY`, `CALENDAR` (iOS-only), `MONTHLY`, `YEARLY`,
  `TIME_INTERVAL`, `DATE`. `TIME_INTERVAL` powers the short-delay **test reminder**
  `scheduleTestReminder(seconds)`.)
- **Cancel:** we stamp `data.habitId` on each scheduled notification, then
  `getAllScheduledNotificationsAsync()` → filter by `habitId` → `cancelScheduledNotificationAsync(id)`.
  A reschedule always cancels this habit's ids first (or `cancelAllScheduledNotificationsAsync()` for a
  full reconcile) ⇒ no duplicates.
- **Time picker:** `@react-native-community/datetimepicker@9.1.0` — Android via the imperative
  `DateTimePickerAndroid.open({ mode:'time', ... })`, iOS via an inline `<DateTimePicker mode="time">`.
  Wrapped in `TimePickerField` (lazy-loaded — see the Expo Go note above). Reminder time is stored as
  minutes-past-midnight; `src/lib/time.ts` converts to/from a `Date`.

Config: `expo-notifications` plugin added to `app.json` (Android tint `#386a20`). The `reminders`
Android channel is created at **runtime** via `setNotificationChannelAsync` (the plugin's
`defaultChannel` only names an FCM default — it doesn't create custom channels).

## 14. Home-screen widget (Phase 10): `react-native-android-widget` ✅ (Android)

The widget is a **native OS target**, not a React screen, so it **cannot run in Expo Go — it
requires a dev/EAS build**. **Pinned (Phase 10, chosen with the user):
`react-native-android-widget@0.21.0`** for **Android**; **iOS WidgetKit is deferred** (needs a
macOS host this Windows box doesn't have — see the Phase 10 handoff). APIs below were verified
against the installed `0.21.0` source before wiring (AGENTS opensrc-first rule), NOT training recall.

**Why this library:** it's the mature, actively-maintained Expo-config-plugin Android widget lib,
and — critically — the widget UI is written in **React** (`FlexWidget`/`TextWidget`/`SvgWidget`/
`OverlapWidget`) and rendered to RemoteViews, so we reuse our `ProgressRing` geometry as an inline
SVG string instead of writing Kotlin drawing code. Its `package.json` devDeps target RN 0.83, but
its peer range is `react-native: "*"` + `expo: ">=54.0.0"` and it autolinks under Expo.

### Verified setup (from installed source + the lib's Expo-Router docs)

**Config plugin (`app.json`)** — one resizable "Today" widget (JSON-serializable, so no
`app.config.ts` needed):
```jsonc
["react-native-android-widget", {
  "widgets": [{
    "name": "Today",                 // MUST match TODAY_WIDGET_NAME in src/lib/widget.ts
    "label": "Happit — Today",
    "minWidth": "180dp", "minHeight": "110dp",
    "targetCellWidth": 2, "targetCellHeight": 1,
    "maxResizeWidth": "360dp", "maxResizeHeight": "180dp",
    "resizeMode": "horizontal|vertical"  // one resizable widget spans small→medium
  }]
}]
```

**Entry (`index.ts` + `package.json` `main`)** — the canonical Expo-Router wiring (verified from
`docs/tutorial/register-task-handler.md`): point `main` at a custom `index.ts` that imports the
router entry for side-effects, then registers the widget's **headless** task handler:
```ts
// package.json:  "main": "index.ts"   (was "expo-router/entry")
// index.ts:
import "expo-router/entry";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTaskHandler } from "@/widget/widgetTaskHandler";
registerWidgetTaskHandler(widgetTaskHandler);
```

**Key API surface (verified 0.21.0):**
- `registerWidgetTaskHandler(handler)` — registers a headless task (`AppRegistry.registerHeadlessTask`).
  The handler gets `{ widgetInfo, widgetAction, clickAction, clickActionData, renderWidget }`;
  `widgetAction ∈ WIDGET_ADDED | WIDGET_UPDATE | WIDGET_RESIZED | WIDGET_DELETED | WIDGET_CLICK`.
- `requestWidgetUpdate({ widgetName, renderWidget, widgetNotFound })` — redraws every placed instance
  of `widgetName`; `renderWidget(info) => JSX | { light, dark }`. This is our refresh trigger.
- **Widgets:** `FlexWidget` (LinearLayout), `OverlapWidget` (FrameLayout — for stacking the count
  over the ring), `TextWidget`, `SvgWidget` (`svg` accepts an SVG **string**). Styling is a flexbox
  subset (see `src/widgets/utils/style.props.ts`); `TextWidget.textAlign` lives in `style`, not as a
  top-level prop.
- **Tap = deep link:** `clickAction: "OPEN_URI"`, `clickActionData: { uri: "happit://today" }` (scheme
  `happit` in app.json). `OPEN_URI` is handled natively (does NOT route through `WIDGET_CLICK`).
- **SVG native renderer:** `com.caverock:androidsvg-aar:1.4` — supports `stroke-dasharray`,
  `stroke-dashoffset`, and `transform="rotate(...)"`, so our ring string renders as a true stroke arc.

### Shared data channel + our wrapper

The widget task runs **headless** (no React tree, no `useLiveQuery`, no theme hooks), so it can't
re-derive today's summary — it reads a **frozen snapshot**. We store that snapshot in the SAME
`key_value` table in `happit.db` (created by migration 0001) that backs preferences, via
**synchronous** expo-sqlite — both the app and the widget's headless JS task share the process/DB, so
no App Group / SharedPreferences plumbing is needed for the Android path. (iOS WidgetKit, deferred,
WILL need an App Group.)

- `src/data/widgetSnapshot.ts` — `WidgetSnapshot` (version, date, done/total, top streak + unit +
  name, resolved accent hex); `computeTodaySnapshot` (freezes the numbers `useTodayHabits` already
  derived — the widget NEVER re-derives streaks), `writeSnapshot`/`readSnapshot` (sync, defensive).
- `src/lib/widget.ts` — the ONE place the native module is touched (mirrors `notifications.ts`):
  `publishTodaySnapshot()` (debounced `requestWidgetUpdate`), Android-only, lazy-`require`d behind a
  `Platform.OS === "android"` + try/catch guard → a **no-op** off-Android and in Expo Go.
- `src/data/WidgetSync.tsx` — a null-render sync (sibling of `ReminderSync`) that subscribes to
  `useTodayHabits`, writes the snapshot, and publishes on every check-in (live-query re-run) + on app
  foreground. Reuses the check-in write path reactively instead of coupling `toggleCheckin` to the lib.
- `src/widget/` — `ring.ts` (SVG string, mirrors `ProgressRing` geometry), `TodayWidget.tsx`
  (`renderTodayWidget()` → `{ light, dark }`, applies **day-rollover** reset when the snapshot's date
  ≠ today), `widgetTaskHandler.tsx` (headless handler).
- Deep-link route `src/app/today.tsx` → `<Redirect href="/">` (Today tab).

> **iOS is unverified** on this Windows box (no macOS). iOS WidgetKit (a targets plugin such as
> `@bacons/apple-targets` + a SwiftUI extension + an App Group) is **deferred**; `src/lib/widget.ts`
> is platform-guarded so it drops in later without touching callers. Android was verified on the
> Pixel_10 dev build — see the Phase 10 handoff.

## 9. Versions / upgrade policy

- Upgrades go through `npx expo install --check` / `npx expo-doctor`. Don't bump a native
  dep independently of the SDK.
- When any version here changes, update the table in §1 and re-verify the affected setup
  snippet against current docs (use Context7 for the library).
