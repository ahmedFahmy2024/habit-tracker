# Phase 2 Handoff — Data Layer (DB, schema, migrations, domain)

**Status:** ✅ complete · **Date:** 2026-07-23
**Verified by:** `tsc --noEmit` clean · `expo lint` clean · `expo-doctor` 20/20 · domain test
suite **35/35 green** (`bun run test`) · migration applied to a fresh in-memory sqlite —
both tables + all 3 indexes created, insert→delete toggle round-trips (1→0), `uniq_habit_day`
blocks a duplicate `(habit, day)` · **on-device (Android emulator Pixel_10, Expo Go):** app
boots through `MigrationGate` on a fresh install (migrations applied), and `/kitchen-sink`
create-habit + toggle-checkin **re-render live via `useLiveQuery`** (0→1 habit; ○🔥0 ↔ ✓🔥1),
no red-box. *(iOS unverified — no macOS host.)*

## What this phase delivered
Maps to [build-plan.md](../build-plan.md) §Phase 2 tasks:

- **Schema** (`src/db/schema.ts`) exactly per [architecture.md](../architecture.md) §4:
  `habits` (flat cadence: `cadenceType` enum + nullable `weekdays` CSV / `weeklyTarget`) and
  `checkins` with the `uniq_habit_day` unique index, `idx_checkins_habit`, `idx_checkins_day`,
  and an `onDelete: 'cascade'` FK. Token-key `color`/`icon` (not hexes). Inferred row types
  exported.
- **drizzle.config.ts** (`dialect: 'sqlite'`, `driver: 'expo'`) → generated the initial
  migration `0000_hesitant_piledriver.sql` + the `migrations.js` bundle under
  `src/db/migrations/`.
- **DB client** (`src/db/client.ts`): `openDatabaseSync('happit.db', { enableChangeListener:
  true })` + `drizzle(expoDb, { schema })`, opened once.
- **Migration gate** (`src/db/MigrationGate.tsx`): `useMigrations` gate with `EmptyState`-based
  loading and recoverable error screens (§8), composed into `src/app/_layout.tsx` under
  `GestureHandlerRootView`.
- **Pure domain, test-first** (`src/domain/`), zero React/DB/expo imports:
  - `cadence.ts` `isScheduledOn` (§7.2) — 7 tests.
  - `streak.ts` `computeStreak` (§7.3) — 16 tests: daily/weekdays backward walk, weekday
    skips don't break, **today-grace**, missed-yesterday breaks, weekly_count on **ISO weeks**
    with **current-week grace**, ISO Sunday→prior-week boundary, future check-ins ignored.
  - `stats.ts` `completionRate` / `bestStreak` / `heatmapBuckets` (§7.3, §9) — 12 tests.
  - `dateUtil.ts` + `types.ts` — shared day-string helpers and the normalized `Cadence` union.
- **Data layer** (`src/data/`): `habits.ts` (`useHabits`, `useHabit`, `createHabit`,
  `archiveHabit`, `cadenceOf` flat↔domain mapper) and `checkins.ts` (`useHabitCheckins`,
  `useCheckinsForDay`, `toggleCheckin`) — live-query reads, intention-named async writes,
  try/catch at the boundary.
- **Throwaway verify UI**: a "DB reactivity (Phase 2 — throwaway)" section in
  `src/app/kitchen-sink.tsx` — create-habit + toggle-checkin buttons reading through
  `useLiveQuery`, to eyeball reactivity on a device. Delete with the kitchen-sink.
- **Test tooling**: `jest` (pinned **v29**), `jest-expo`, `@types/jest`,
  `babel-plugin-inline-import`; `jest.config.js` (preset `jest-expo/node`, matches
  `src/domain/**/*.test.ts`); `test` script.

## Key files added/changed
- `src/db/schema.ts` — the ONE schema source (habits + checkins).
- `src/db/client.ts` — the DB singleton (`expoDb` + `db`), change listeners on.
- `src/db/MigrationGate.tsx` — boot migration gate + loading/error screens.
- `src/db/sql.d.ts` — ambient `declare module '*.sql'` so tsc accepts the migration import.
- `src/db/migrations/*` — generated SQL + `migrations.js` + meta (never hand-edit).
- `drizzle.config.ts` — drizzle-kit config (dialect sqlite, driver expo).
- `src/domain/{cadence,streak,stats,dateUtil,types,index}.ts` + matching `*.test.ts`.
- `src/data/{habits,checkins}.ts` — the DB access layer.
- `src/app/_layout.tsx` — wrapped the Stack in `<MigrationGate>`.
- `src/app/kitchen-sink.tsx` — added the throwaway DB reactivity section.
- `src/lib/strings.ts` — added `migration.*` copy for the gate screens.
- `metro.config.js` — `config.resolver.sourceExts.push('sql')`.
- `babel.config.js` — added `['babel-plugin-inline-import', { extensions: ['.sql'] }]` before
  the worklets plugin.
- `tsconfig.json` — added `"types": ["jest"]`.
- `jest.config.js` (new), `package.json` (deps + `test` script).
- `docs/library-docs.md` — corrected the drizzle §4 metro/babel `.sql` setup; recorded
  jest-v29 pin + new deps. `docs/handoffs/README.md`, `docs/progress-tracker.md` updated.

## Decisions made (and why)
- **`sqliteTable` extra-config uses the ARRAY form `(t) => [...]`, not the object form** the
  architecture.md §4 snippet shows. In drizzle **0.45.2** the object form is `@deprecated`;
  the array form generates the identical schema without the warning. (Verified from installed
  `sqlite-core/table.d.ts`.) The migration SQL is byte-for-byte what §4 intends.
- **Jest pinned to v29.** `jest-expo@57` peers on jest 29; jest 30 crashes at runtime with
  `clearMocksOnScope is not a function`. Recorded in library-docs.md.
- **Domain uses the `jest-expo/node` preset**, not the full RN preset — the domain is pure,
  so a Node env is correct and fast while staying on the jest-expo toolchain the docs name.
- **`.sql` import needs `babel-plugin-inline-import` + `sourceExts`** — the old library-docs
  claim that it "works out of the box with babel-preset-expo" was wrong and is now corrected.
- **Domain `Cadence` is a discriminated union**, decoupled from the flat DB row; `cadenceOf`
  in `src/data/habits.ts` is the single flat↔domain bridge, so the domain never imports DB
  types (code-standards §5/§7 import direction). A malformed row falls back safely + logs.
- **Client export is `expoDb`** (not `expo`) to avoid shadowing the `expo` package namespace;
  docs snippet updated to match.
- **Today-grace / current-week-grace also apply to `bestStreak`** so the current run can still
  register as the best when it is (an unchecked scheduled today doesn't reset the run).

## Gotchas / things the next agent must know
- **After editing metro/babel, restart Metro with `--clear`** (same rule as Phase 0) — the
  `.sql` transform won't apply to a cached bundle.
- **Days are `YYYY-MM-DD` strings compared lexicographically.** Domain parses them to *local
  midnight* only for weekday/ISO-week math and formats back with `yyyy-MM-dd`; all arithmetic
  is whole-calendar-day (`addDays`/`subDays`), so DST/travel can't shift a day (§7.5).
- **ISO weeks, not display week-start.** `isoWeekKey` keys weekly streaks; `2023-01-01` (Sun)
  → `2022-W52`. The user's week-start preference is display-only and must never touch streaks.
- **`weekly_count` streak/best unit is WEEKS; daily/weekdays is DAYS.** Callers must label
  accordingly (Phase 5/6).
- **`toggleCheckin` is insert-or-delete against `uniq_habit_day`** and uses
  `onConflictDoNothing()` on insert so a race resolves to "checked" instead of throwing.
- **Never `new Date()` in domain code.** It's allowed at the data boundary
  (`archiveHabit` timestamp) and in the throwaway kitchen-sink `TODAY`, not in `src/domain`.
- **`tsconfig` now sets `"types": ["jest"]`** — expo/nativewind ambient types come via the
  `include` globs (`expo-env.d.ts`, `nativewind-env.d.ts`), so this didn't drop them; tsc is
  clean. If you add another global types package, add it to this array.
- **Migration proof was headless** (bun:sqlite applying the generated SQL). It confirms the
  schema/SQL/uniqueness; it does not exercise the RN `useMigrations` hook or `useLiveQuery`
  re-render — do that on a simulator via `/kitchen-sink`.

## What is NOT done yet (deferred)
- **iOS not verified.** The on-device pass ran on an **Android** emulator only (no macOS host
  for an iOS simulator). Android confirmed migrations-on-fresh-install + `useLiveQuery`
  reactivity; re-check on iOS when a Mac is available.
- **`updateHabit` is not built** — only `createHabit`/`archiveHabit`. Edit lands in Phase 4.
- **No reorder / sortOrder management writes** beyond accepting a `sortOrder` on create
  (Phase 4).
- **No data-hook integration tests** (code-standards §11 calls them "light, where practical").
  Domain unit tests are the correctness surface this phase; a temp-sqlite integration test for
  `toggleCheckin`/`createHabit` is a reasonable Phase 3/4 add.
- **`useTodayHabits`** (habits filtered by `isScheduledOn(today)`) is **not** here — it's a
  Phase 5 composition over `useHabits` + `isScheduledOn`.
- **kitchen-sink DB section is throwaway** — delete with the screen once real features exist.

## Next phase
- **Phase 3 — Navigation shell** ([build-plan.md](../build-plan.md) §Phase 3): the
  four-screen skeleton navigable but empty-and-real. First tasks: `(tabs)/_layout.tsx` native
  bottom tabs (Today / Habits / Settings), placeholder tab screens using `EmptyState`, wire
  `habit/[id]` (push) and `habit/new` (modal), and confirm the root `_layout.tsx` provider
  order (GestureHandlerRoot → Theme → **MigrationGate** → Stack/Tabs). Done when you can tab
  between screens, open a detail push and a modal, and back out with native transitions and
  safe areas respected.
