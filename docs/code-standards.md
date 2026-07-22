# Code Standards — Happit

> Conventions that keep the codebase consistent and reviewable. These are enforced by
> lint/format where possible and by review where not.

Related: [architecture.md](./architecture.md) (structure) · [ui-rules.md](./ui-rules.md).

---

## 1. Language & tooling

- **TypeScript, strict.** `tsconfig` has `strict: true`, `noUncheckedIndexedAccess: true`.
  No `any` — use `unknown` + narrowing. No `@ts-ignore` without a `// reason:` comment.
- **ESLint** (`eslint-config-expo`) + **Prettier**. Formatting is not discussed in review;
  Prettier decides. Run on pre-commit.
- **Path alias:** `@/` → `src/` (configured in `tsconfig` + `babel-plugin-module-resolver`
  / metro). Import `@/domain/streak`, not `../../../domain/streak`.

## 2. File & naming conventions

| Thing | Convention | Example |
| --- | --- | --- |
| Component files | `PascalCase.tsx` | `HabitCard.tsx` |
| Hook files | `camelCase.ts`, hook exported as `useX` | `useHabits.ts` |
| Domain/util files | `camelCase.ts` | `streak.ts` |
| Route files | Expo Router convention (lowercase, brackets) | `[id].tsx`, `(tabs)` |
| Types/interfaces | `PascalCase` | `Habit`, `Cadence` |
| Constants | `UPPER_SNAKE_CASE` | `HABIT_PALETTES` |
| Token keys | as defined in [ui-tokens.md](./ui-tokens.md) | `space.4` |

- One primary component per file, named same as the file. Small sub-components may share a
  file if only used there.
- Barrel `index.ts` files only for `src/ui/primitives` and `src/ui/habit`.

## 3. Component conventions

- **Function components + hooks only.** No class components.
- Props type is `ComponentNameProps`, declared above the component. Destructure props in
  the signature.
- **No business logic in components.** Components render and delegate. Data comes from
  `src/data` hooks; computation from `src/domain`. A component that imports `drizzle` or
  does streak math is a bug.
- **Styling:** NativeWind `className` first. When a value is dynamic (habit accent, animated
  style), use reanimated styles / the `useTheme()` values — still only token-derived.
  **Never** a raw hex/number literal in a component (see [ui-rules.md](./ui-rules.md) §1).
- Keep route files (`app/**`) thin: compose components + call hooks. No `StyleSheet` blocks,
  no SQL.

## 4. Data layer conventions

- All DB access goes through `src/data/*` hooks/functions. Screens never import `db`
  directly.
- **Reads** use `useLiveQuery` (reactive). **Writes** are async functions returning a
  promise; call sites `await` and handle errors.
- Writes are small and intention-named: `toggleCheckin`, `archiveHabit`, `createHabit` —
  not generic `update(table, data)`.
- IDs are generated in `src/lib/id.ts` (uuid). Never rely on autoincrement for `id`.
- **Never** mutate returned query objects; treat DB rows as immutable snapshots.

## 5. Domain layer conventions

- Pure functions only. **No** imports of React, drizzle, or `expo-*`. Input = plain data +
  an explicit `now`/`today`. Output = plain data.
- Every exported domain function has unit tests (`*.test.ts`) covering the edge cases named
  in [architecture.md](./architecture.md) §7 (today-grace, weekday skips, weekly ISO weeks,
  DST/travel).
- Dates handled as `YYYY-MM-DD` strings for day-level logic; `date-fns` for arithmetic.
  Never `new Date()` inside domain code.

## 6. State conventions

- **Server/persistent state = the DB.** Do not mirror habits/check-ins into zustand/React
  state.
- **`zustand`** holds only device **preferences** (theme mode, accent, week-start) —
  persisted via `zustand/middleware persist` backed by `expo-sqlite`/`AsyncStorage`
  wrapper. Small, flat stores.
- Local UI state (form fields, open/closed) = `useState`. Don't globalize it.

## 7. Imports & module hygiene

- Order: (1) react/react-native, (2) third-party, (3) `@/…` internal, (4) relative.
  (eslint-plugin-import enforces.)
- No circular deps between layers. Allowed direction only:
  `app → ui → data → domain → lib`, and `ui/data/domain → theme/lib`. `domain` imports
  nothing app-specific.

## 8. Errors & logging

- User-facing failures render a state (see [architecture.md](./architecture.md) §8), never
  a bare crash or silent no-op.
- Use a thin `logger` (`src/lib/logger.ts`) not scattered `console.log`. No logs left in
  committed code except intentional `logger.warn/error`.
- Wrap DB writes in try/catch at the `src/data` boundary; surface a friendly message,
  log the real error.

## 9. Async & effects

- `useEffect` dependency arrays are complete and honest; disable the lint rule only with a
  `// reason:`.
- Long computations (full-history stats) are memoized (`useMemo` keyed on
  `habitId + today + checkinsVersion`) or moved off the render path.
- No floating promises — `await` or explicitly `void`.

## 10. Accessibility & i18n

- Accessibility is a review gate, not optional (see [ui-rules.md](./ui-rules.md) §8).
- All user-facing strings live in one place (`src/lib/strings.ts`) even though v1 is
  English-only, so a future locale is a data change, not a hunt.

## 11. Testing

- **Domain:** unit tests required (Jest / `jest-expo`). This is where correctness lives.
- **Data hooks:** light integration tests against an in-memory/temp sqlite where practical.
- **Components:** smoke-render key components; not chasing coverage %, chasing the risky
  parts (CheckControl states, streak display).
- A change to streak/cadence logic **must** update/add tests in the same commit.

## 12. Commits & branches

- Small, focused commits; imperative subject ("Add CheckControl morph animation").
- Reference the build-plan phase where relevant. Keep `main` releasable.

## 13. Comments

- Comment the **why**, not the **what**. The tricky domain rules get comments linking back
  to [architecture.md](./architecture.md) §7. Obvious code stays uncommented.
