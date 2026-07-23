# Phase 7 Handoff — Settings & data safety

**Status:** 🟨 code-complete · on-device confirmation of the dark-theme fix + export/import
round-trip **pending** (see the "NOT done yet" section and
[phase-7-BLOCKERS.md](./phase-7-BLOCKERS.md)) · **Date:** 2026-07-23
**Verified by:** `tsc --noEmit` clean · `expo lint` 0 warnings · `expo-doctor` 20/20 · domain
suite **35/35 green** (proves week-start didn't touch the domain) · a throwaway Node script
proving the week-order rotation + backup validate/round-trip logic (all cases pass) ·
**on-device (Android emulator Pixel_10, Expo Go):** Settings screen renders every section, prefs
persist, and theme-mode toggling flips the habit-accent palette + the native tab bar. **What is
NOT yet live-confirmed:** that the `.dark:root` fix flips the NativeWind *surfaces* (found +
fixed after the first dark test; the emulator/adb link wedged before re-confirmation), and the
export→wipe→import round-trip on-device. *(iOS unverified — no macOS host.)*

## What this phase delivered
Maps to [build-plan.md](../build-plan.md) §Phase 7 tasks:

- **Preferences store** (`src/store/preferences.ts`, new) — a tiny zustand store
  `{ themeMode: 'light'|'dark'|'system', accentKey: HabitColorKey, weekStart: 0|1 }`. **Persisted
  in a `key_value` table in the same `happit.db`** and **hydrated synchronously at module load**
  via `expoDb.getFirstSync` — so the value is present on the first render and there is **no theme
  flash** on cold start (the `persist` middleware would rehydrate async and flash). Setters
  write-through synchronously (`runSync` upsert). Defensive: reads never throw (table-missing
  pre-migration → defaults; corrupt JSON → defaults; each field validated against its enum). A
  `hydrate()` re-reads once after migrations, in case the store loaded before the table existed.
- **`ThemeSync`** (`src/theme/ThemeSync.tsx`, new) — mounted inside `MigrationGate`; applies
  `themeMode` to NativeWind via `setColorScheme(mode)` (native `'system'` follows the OS; explicit
  light/dark override it) and re-hydrates prefs post-migration. Renders nothing. This is the one
  code path that drives theming — no inline `light`/`dark` branches (ui-rules §2). `useTheme()`
  is unchanged (still reads the resolved scheme).
- **Week-start = display-only** (`src/lib/weekOrder.ts`, new) — pure `weekdayDisplayOrder(0|1)`
  (rotates the fixed Sunday-first weekday **numbers** — numbers unchanged, only position) and
  `reorderBySunday(arr, 0|1)` (rotates a legend/label array in lockstep). **CadencePicker** weekday
  chips and the **Heatmap** legend + row assignment now reorder by `weekStart`
  (`(weekday - weekStart + 7) % 7` for the heatmap row). `weekdayOf`, `isScheduledOn`, ISO-week
  math, and streaks are **never** given `weekStart` — proven by the 35 domain tests still passing
  and the Node script. The old `WEEKDAY_DISPLAY_ORDER` constant (a Sunday-first fixed array) was
  removed as superseded.
- **Export / import** (`src/data/backup.ts`, new) — lossless round-trip of ALL habits + check-ins:
  - **Export:** serialize `{ version: 1, exportedAt, habits[], checkins[] }` (raw rows, verbatim)
    to a JSON file in `Paths.cache` (new `expo-file-system` `File`/`Paths` API) and open the OS
    share sheet (`expo-sharing`). Returns `{ ok:false }` when there are no habits (empty note);
    `sharedUnavailable` when the sheet can't show (file still written).
  - **Import:** pick a `.json` (`expo-document-picker`), read it, **validate** (structural +
    per-row field checks; rejects a **newer `version`** and **orphan check-ins** whose `habitId`
    isn't in the file), then **replace-all in ONE `expoDb.withTransactionSync`** (delete checkins
    + habits, insert the file's rows). All-or-nothing: a mid-import failure rolls back, so a bad
    file never leaves partial data. Returns a discriminated `ImportOutcome`
    (`canceled` / `invalid` / `imported{counts}`) for the right Alert.
  - **Prefs are deliberately NOT in the backup** (they live in `key_value`, not user data).
- **Settings screen** (`src/app/(tabs)/settings.tsx`, rewritten from the Phase-3 shell) — **thin**:
  reads `usePreferences` + calls `backup`. Sections composed from primitives + the new settings
  components: **Appearance** (theme `SegmentedControl` + accent `ColorPicker` reused as the accent
  picker), **General** (week-start `SegmentedControl` + display-only footer), **Your data** (Export
  / Import action rows; import shows a destructive replace-all confirm first, §8), **About**
  (version from `Constants.expoConfig?.version`). Outcomes surface via `Alert`.
- **New UI components** — `SegmentedControl<T>` (generic, `src/ui/primitives/`, extracted from the
  CadencePicker pattern) + `SettingsSection` / `SettingsRow` (`src/ui/settings/`, neutral chrome:
  no habit accent, ui-rules §7). All tokens/roles only; registered in ui-registry.md 🟢.
- **New deps** (via `bunx expo install`, recorded in [library-docs.md](../library-docs.md) §12):
  `expo-file-system@57.0.1`, `expo-sharing@57.0.7`, `expo-document-picker@57.0.1`. `expo-sharing`
  auto-added its config plugin to `app.json`.
- **Migration `0001_lush_obadiah_stane.sql`** — creates the `key_value` table (added to
  `schema.ts`; bundled in `migrations.js`).

## Key files added/changed
- `src/store/preferences.ts` + `src/store/index.ts` — **new** (prefs store + barrel).
- `src/lib/weekOrder.ts` — **new** (display-only week-order helpers); `src/lib/index.ts` exports
  them; `src/lib/cadence.ts` dropped the superseded `WEEKDAY_DISPLAY_ORDER`.
- `src/data/backup.ts` — **new** (export/import; File/Paths + Sharing + DocumentPicker;
  replace-all transaction; validation).
- `src/db/schema.ts` — added `key_value`; `src/db/migrations/0001_*.sql` + `migrations.js` bundle.
- `src/theme/ThemeSync.tsx` — **new**; `src/theme/index.ts` exports it.
- `src/app/_layout.tsx` — mounted `<ThemeSync/>` inside `MigrationGate`.
- `src/app/(tabs)/settings.tsx` — the real thin Settings screen.
- `src/ui/primitives/SegmentedControl.tsx` (+ barrel); `src/ui/settings/{SettingsSection,SettingsRow,index}.tsx`.
- `src/ui/habit/CadencePicker.tsx` + `src/ui/habit/Heatmap.tsx` — week-start display reorder.
- **`src/global.css` — `.dark` → `.dark:root`** (the dark-variable fix; see Gotchas).
- `src/lib/strings.ts` — fleshed-out `settings.*` section.
- `docs/library-docs.md` §8 + §12; `docs/ui-registry.md` (SegmentedControl / SettingsSection /
  SettingsRow specs, 🟢; AccentPicker = reuse ColorPicker).

## Decisions made (and why) — the four blocking calls, confirmed with the user
- **Prefs persistence = a `key_value` table in `happit.db`, hydrated synchronously** (not the
  zustand `persist` middleware / AsyncStorage). We already own a sync sqlite connection, so the
  read completes before first paint → **zero theme flash**, and no new dependency.
- **`system` theme = NativeWind `setColorScheme('system')`.** NativeWind natively supports
  `'system'` (follows the OS, no manual `.dark` class juggling); explicit light/dark override it.
  One code path, instant re-theme.
- **Import = replace-all inside one transaction, versioned + validated.** Lossless with no id/dup
  ambiguity; all-or-nothing rollback protects against a bad file. `version` field + newer-version
  rejection gives forward-compat.
- **Export = write JSON + `expo-sharing` share sheet; import via `expo-document-picker`.** The
  simplest lossless local path (no network, no backend); the file shape is
  `{ version, exportedAt, habits[], checkins[] }` (raw rows).

## Gotchas / things the next agent must know
- **⚠️ `global.css` dark CSS variables MUST use `.dark:root`, not a bare `.dark`.** On native,
  `react-native-css-interop` registers dark *variables* only from a `.dark:root` (or
  `:root[class~="dark"]`) selector — verified in the installed
  `css-to-rn/normalize-selectors.js` `isRootDarkVariableSelector`. A bare `.dark { --x }` is
  treated as a descendant *style rule*, so its variables never apply and **surfaces stay light in
  dark mode** even though `useColorScheme`/habit-colors flip. This was a **latent pre-Phase-7 bug**
  (no earlier phase eyeballed dark surfaces on-device) — fixed here. **A `global.css` change needs
  a Metro `--clear` restart.**
- **`importData` uses a platform split for the file read** (in `backup.ts`): **Android does NOT
  copy** (`copyToCacheDirectory: false`) and reads the SAF `content://` URI in place — the picker's
  app-level cache copy is denied READ by Expo Go's `ScopedFilePermissionService`
  (`ERR_INVALID_PERMISSION`), while a `content://` URI skips that path check. **iOS keeps the copy**
  (the experience-scoped caches dir is readable; the original security-scoped URL may not be after
  the picker closes). Verified against the installed expo source.
- **The store hydrates at module load, possibly before migrations create `key_value`.** The read is
  wrapped so a missing table → defaults; `ThemeSync` calls `hydrate()` after migrations to pick up
  the persisted values. Don't remove that re-hydrate.
- **Require-cycle avoidance:** `preferences.ts` imports `@/theme/habitColors` **directly**, not the
  `@/theme` barrel (the barrel re-exports `ThemeSync`, which imports the store → a cycle). Keep
  specific imports in the store.
- **Week-start is display-only — do not regress.** `weekOrder.ts` only ever rotates a fixed
  sequence; nothing in `src/domain` receives `weekStart`. If you add a new weekday-facing view,
  reorder its *display* with `weekdayDisplayOrder`/`reorderBySunday`, never re-number a `Weekday`.
- **On-device flakiness was environment, not code:** the Pixel_10 AVD needs `-memory 3072`
  (Phase-6 note), and during this session an `adb shell am start` left in the background wedged the
  adb transport (0-byte screencaps, `adb devices` timeouts). Recovery: kill the stray `adb.exe`,
  `adb start-server`, `adb reverse tcp:8081 tcp:8081`, then cold-relaunch Expo Go.

## What is NOT done yet (deferred)
- **Live confirmation of the `.dark:root` fix** — the fix is applied and grounded in the installed
  source, but the emulator wedged before a dark-surfaces screenshot. **First task next session:**
  toggle Dark and confirm the background/surfaces flip (not just habit colors), across all tabs.
- **Live export→wipe→import round-trip** — the validate/round-trip logic is proven in a Node
  script, but not exercised end-to-end on the device (share sheet + document picker + restore).
  This is the core done-when; run it next session.
- **Live week-start display reorder** on-device (chips + heatmap legend) — proven in logic/tests,
  not re-shot live.
- **iOS unverified** — Android emulator only (no macOS host).
- **Accent-key preference is stored + picked, but its app-wide *effect* is minimal in v1.** The
  accent pref persists and the ColorPicker reflects it; wiring it to actually re-tint app chrome
  (beyond per-habit colors, which come from each habit's own `color`) is a reasonable Phase-8
  polish item — decide the exact surface it should tint.
- See [phase-7-BLOCKERS.md](./phase-7-BLOCKERS.md) for the exact cold-start steps to close these.

## Next phase
- **Phase 8 — Polish, a11y, performance pass** ([build-plan.md](../build-plan.md) §Phase 8):
  the full ui-rules §1 checklist audit on every screen; a11y pass (labels/roles/dynamic type/
  reduced motion, ui-rules §8); cold-start & interaction perf vs architecture §9; empty/error/
  loading states everywhere (§8); icon/splash + app config + an EAS build. **First, close the
  Phase-7 live-verification gaps above** (dark surfaces + export/import round-trip) since Phase 8's
  done-when ("project-overview §3 goals demonstrably met on a real device") assumes Phase 7 is
  fully proven on-device.
