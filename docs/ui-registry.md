# UI Registry — Happit

> The inventory of every reusable UI component. Before building any UI, check here. If it
> exists, reuse it. If it doesn't, add its spec here **first** (per
> [ui-rules.md](./ui-rules.md) §9), then build it. This prevents one-off components that
> drift from the system.

Location: primitives in `src/ui/primitives/`, habit-specific in `src/ui/habit/`.
All components consume [ui-tokens.md](./ui-tokens.md) and obey [ui-rules.md](./ui-rules.md).

Status legend: 🟢 built · 🟡 spec'd, not built · ⚪ future.

---

## Primitives (`src/ui/primitives/`)

> **Icon set (decided Phase 1):** primitives use **`@expo/vector-icons` →
> `MaterialCommunityIcons`** via the `Icon` primitive below (works iOS/Android/web; best M3
> fit). SF Symbols (`expo-symbols`) remain reserved for native-tab icons only.

### `Icon` 🟢
Single icon primitive over `@expo/vector-icons/MaterialCommunityIcons`.
- **Props:** `name: IconName` (typed glyph union), `size?` (default 24),
  `color?` (role token, default `onSurface`), `colorValue?` (raw override for on-accent icons).
- **Rules:** the only way to render an icon. Color is a theme role or an explicit dynamic
  value (habit accent) — never an inline hex.

### `Text` 🟢
Typed wrapper enforcing the type scale.
- **Props:** `variant: 'display.medium' | 'headline.large' | … | 'label.small'` (see
  [ui-tokens.md](./ui-tokens.md) §2), `color?` (role token, default `onSurface`),
  `colorValue?` (raw override — for per-user accent on-colors only, mirrors `Icon.colorValue`),
  `emphasized?: boolean`, plus RN `Text` props.
- **Rules:** the *only* way to render text. Scales with dynamic type. No inline fontSize.
  `colorValue` is reserved for the global-accent on-color (Phase 8); use `color` (a role) elsewhere.

### `Surface` 🟢
Tonal container; the elevation primitive.
- **Props:** `level: 0|1|2|3` (maps to `surfaceContainer*` + optional shadow),
  `radius?: keyof radius` (default `lg`), `padding?: keyof space`.
- **Rules:** elevation via tone first (see [ui-tokens.md](./ui-tokens.md) §5).

### `Pressable` 🟢
Base interactive wrapper. Everything tappable is built on this.
- **Props:** `onPress`, `haptic?: keyof haptic | null` (default `press`),
  `scaleOnPress?: boolean` (default true → `motion.scale.press`), `disabled?`,
  `style?` (static container style, merged under the animated transform), plus a11y props.
- **Rules:** applies press-in scale + haptic + honors reduced motion automatically. Ensures
  ≥48dp target via hitSlop.

### `Button` 🟢
- **Variants:** `filled` (accent fill), `tonal` (accent container), `outlined` (accent border/label),
  `text` (accent label). **All variants carry the global accent** (Phase 8, via `useAccent()`) — the
  filled/outlined/text label + the outlined border are the accent; the filled content is `onAccent`.
- **Props:** `variant`, `label`, `icon?`, `onPress`, `loading?`, `disabled?`, `fullWidth?`.
- **Shape:** `full` (pill). **Type:** `label.large`. **Motion:** press scale + spring back.

> **Global accent (Phase 8):** `useAccent()` (`src/theme/useTheme.ts`) resolves the persisted
> `accentKey` preference into its tonal palette for the active scheme. It is the ONE place app
> chrome reads the accent, so the whole app re-tints from a single preference. Consumers: **`FAB`,
> `Button` (all variants), `ProgressRing` (default arc), `CompletionSummary` ("All done!")**. Habit
> cards/CheckControl keep their OWN per-habit color via `useHabitColors` — the accent never overrides
> those. The `SegmentedControl` selected tint stays on the neutral M3 `primaryContainer` role (out of
> the accent's scope — it's a settings-local control).

### `IconButton` 🟢
- **Props:** `icon`, `onPress`, `variant?: 'standard'|'tonal'|'filled'`, `size?`,
  `accessibilityLabel` (**required**).
- 48dp target regardless of icon size.

### `Chip` 🟢
Selectable/filter chip (used for weekday & cadence selection).
- **Props:** `label`, `selected?`, `onPress`, `icon?`.
- **Rules:** selection morphs shape + fills `secondaryContainer` (not just border). Fires
  `haptic.select`.

### `FAB` 🟢
Floating action button — "add habit".
- **Props:** `icon`, `onPress`, `label?` (extended FAB), `accessibilityLabel`.
- **Shape:** `full` (or `lg` if extended). `elevation.3`. `z.fab`. Lower-right, safe-area
  aware.

### `TextField` 🟢
- **Props:** `value`, `onChangeText`, `label`, `placeholder?`, `error?`, `maxLength?`,
  `autoFocus?`.
- M3 outlined style; label animates; error uses `error` role.

### `ProgressRing` 🟢
Circular completion indicator (Today header).
- **Props:** `value: 0..1`, `size?`, `strokeWidth?`, `celebrateOn100?: boolean`, `label?`
  (center content), `accessibilityLabel?`.
- **Render:** `react-native-svg` (§library-docs §11) — a track `Circle` + a progress `Circle`
  whose `strokeDashoffset` animates from `circumference → circumference*(1-value)` via
  reanimated `useAnimatedProps` on `springs.default`. Track = `surfaceContainerHighest`,
  progress = `primary`.
- **Motion:** animates fill on change; `motion.spring.bouncy` scale pop at 100% +
  `haptic.celebrate` (once per rising edge). Reduced motion → snap to value, no pop.

### `EmptyState` 🟢
- **Props:** `glyph` (IconName), `title`, `body?`, `action?: { label, onPress }`.
- Uses `headline.large` title. Never render a bare "no data" anywhere else — use this.

### `SegmentedControl<T>` 🟢
Generic single-select segmented control (the pattern CadencePicker uses inline, extracted for
reuse — Settings' theme-mode + week-start selectors).
- **Props:** `segments: { key: T; label: string }[]`, `selected: T`, `onSelect: (key: T) => void`,
  `accessibilityLabel?`.
- **Render:** a `surfaceContainer`-tinted pill track; the selected segment is a
  `secondaryContainer` filled pill that **springs** across on change (`springs.default`; instant
  under reduced motion). Each segment is a `Pressable` (`haptic.select`, ≥48dp via `minHeight`),
  `label.large`, `onSecondaryContainer` when selected else `onSurfaceVariant`. Tokens/roles only.
- **A11y:** each segment `role="button"` with `accessibilityState={{ selected }}`.
- **Note:** CadencePicker keeps its own copy (its highlight math differs slightly); this is the
  shared version for neutral settings selectors. No new tokens.

### `Sheet` / `Modal` 🟡
Wrapper over Expo Router modal presentation for add/edit habit.
- **Props:** children, `title`, `onClose`. Native present; content fades in (`motion.enter`).

### `Divider` ⚪, `Badge` ⚪, `Snackbar` ⚪
Spec when first needed.

---

## Habit components (`src/ui/habit/`)

### `CheckControl` 🟢 — the signature control
Large toggle that marks a habit done.
- **Props:** `checked: boolean`, `onToggle`, `colorKey: HabitColorKey`, `label` (habit name,
  for a11y), `size?` (default 48).
- **Visual:** idle = outlined rounded-square (`radius.md`) in the habit accent; active =
  filled circle (`radius.full`, accent fill) with an animated drawn check.
- **Render:** the morphing square/circle is an `Animated.View` (radius + `backgroundColor` +
  `borderWidth` interpolated on a `progress` shared value); the check is a `react-native-svg`
  `Path` whose `strokeDashoffset` animates the stroke on (§library-docs §11), drawn in
  `onContainer`/`onPrimary`-style contrast over the accent.
- **Motion:** shape morph (`md`↔`full`) + fill + check stroke-draw + `motion.scale.pop`, all on
  `motion.spring.bouncy`. Reduced motion → cross-fade (progress via `timings.fast`, no pop,
  check offset set directly).
- **Haptics:** `haptic.check` on check, `haptic.uncheck` on uncheck.
- **A11y:** `role="checkbox"`, `accessibilityState={{ checked }}`, label = habit name.

### `HabitCard` 🟢 — Today list item
- **Props:** `habit`, `checked`, `streak`, `streakUnit: 'days'|'weeks'`, `onToggle`, `onOpen`.
- **Layout:** accent-tinted card (habit `container` color) — leading icon chip (accent
  `onContainer` fill, `container` glyph), `title.medium` name, `label.medium` streak in
  `onContainer` (e.g. "🔥 5" for days / "🔥 3 wk" for weeks; hidden when streak is 0), trailing
  `CheckControl`. Per-habit color is the raw palette value (ui-tokens §1.3), applied via `style`.
- **Two targets:** the card **body** `Pressable` → `onOpen` (detail); the sibling `CheckControl`
  → `onToggle`. Both ≥48dp, non-overlapping.
- **Motion:** entrance stagger is applied by the Today screen (`FadeInDown.delay`, capped by
  `stagger.max`; 0 delay under reduced motion). Body press scale via `Pressable`.

### `HabitListRow` 🟢 — Habits (manage) list item
- **Props:** `habit: Habit`, `onEdit: () => void`, `onArchive: () => void`,
  `onDrag?: () => void`, `isActive?: boolean`.
- Denser than HabitCard. Leading habit-accent icon chip, `title.medium` name, `label.medium`
  cadence summary (from `cadenceSummary(cadenceOf(habit))`). Tapping the row body → `onEdit`
  (opens `habit/edit/[id]`). A trailing **drag handle** (`Icon "drag-horizontal-variant"`,
  `onLongPress`/press → `onDrag` from draggable-flatlist's `RenderItemParams`) starts a
  reorder; `isActive` lifts the row (wrapped in `ScaleDecorator`).
- **Archive:** the row is wrapped in `ReanimatedSwipeable`; swiping left reveals an
  `error`-tinted Archive action → confirm (Alert) → `onArchive`. (docs/library-docs.md §10)

### `StreakBadge` 🟢
- **Props:** `current: number`, `best: number`, `unit: 'days' | 'weeks'`, `colorKey: HabitColorKey`.
- **Presentation only** — takes already-computed numbers (all domain math lives in the
  `useHabitStats(id, today)` data hook, memoized per §9; the badge never computes).
- **Hero layout:** the **current** streak number in `display.medium` **emphasized** (ui-tokens
  §2, ui-rules §5), tinted with the habit **accent** (`useHabitColors(colorKey).accent`, raw
  value via `style` — a per-habit tint can't be a global M3 role, ui-tokens §1.3), with a
  `label.large` unit caption ("day streak" / "week streak"). A `label.medium` "Best: N" line
  sits beneath in `onSurfaceVariant`. A leading 🔥 marks a live (>0) streak; at 0 the hero reads
  a quiet "No streak yet" (`headline.medium`, no scary "🔥 0", matching the Today card rule).
  No new tokens.
- **A11y:** the number+unit is one label ("N day streak, best M"); decorative emoji not read.

### `Heatmap` 🟢 — calendar history
- **Props:** `buckets: HeatmapBucket[]` (from `heatmapBuckets`, chronological), `colorKey:
  HabitColorKey`, `today: DayString`, `onToggleDay: (day) => void`.
- **Render (decided Phase 6):** a **pure View/flex grid** (not SVG) — GitHub-style columns of
  weeks (Sunday-top), each cell an independent `Pressable` so a tap maps cleanly to its `day`
  string and gets a 48dp `hitSlop` target. Geometry + per-state cell fills come from
  `heatmap.*` tokens + roles ([ui-tokens.md](./ui-tokens.md) §9): `done` = habit `accent`,
  `missed` (past scheduled unchecked) = subtle `errorContainer`, `unscheduled` =
  `surfaceContainerHighest`, future/out-of-range = `surfaceContainerLow`.
- **Window:** the last `heatmap.weeks` (26) weeks, **horizontally scrollable** (newest at the
  right, scrolled into view). Backfill is limited to this window.
- **Interaction:** tapping a **past or today** cell calls `onToggleDay(day)` (backfill via
  `toggleCheckin`, [architecture.md](./architecture.md) §7.4) + `haptic.check`/`uncheck`;
  **future days are non-interactive** (disabled, recessed fill). The screen re-derives buckets
  reactively via `useHabitStats`.
- **A11y:** each interactive cell is a `checkbox` with `accessibilityState={{ checked }}` and a
  day+state label; future cells are not focusable. A weekday-row + month label legend orients it.

### `CadencePicker` 🟢 — used in add/edit habit
- **Props:** `value: Cadence`, `onChange: (c: Cadence) => void`.
- A **segmented control** (Daily / Weekdays / N-per-week) built from `Pressable` segments in a
  `secondaryContainer`-tinted track (selected segment morphs to a filled pill; `haptic.select`).
  - **Weekdays** reveals 7 `Chip`s (S M T W T F S) in **display order**; selecting toggles a
    `Weekday` (0=Sun..6=Sat, docs/architecture.md §7.2). Week-start reorders **display only**
    (Phase-7 pref; defaults Sunday-first until then). Emits `{ type: 'weekdays', weekdays }`.
  - **N-per-week** reveals a stepper (− N +, 1..7) → `{ type: 'weekly_count', weeklyTarget }`.
  - **Daily** → `{ type: 'daily' }`.
- Emits the normalized `Cadence` union; the data layer's `cadenceColumns` maps it flat.
- No new tokens — uses `secondaryContainer`/`surface` roles, `radius.full`, `springs.default`.

### `ColorPicker` 🟢 & `IconPicker` 🟢
- **ColorPicker props:** `value: HabitColorKey`, `onChange: (k: HabitColorKey) => void`.
  A wrap grid of the 8 habit color swatches (each a habit-`accent` filled circle). Selected
  swatch morphs (ring + scale pop, `springs.bouncy`) + `haptic.select`. Stores the **key**.
- **IconPicker props:** `value: IconName`, `onChange: (n: IconName) => void`,
  `colorKey?: HabitColorKey` (tints the selected cell with the habit accent). A wrap grid over
  a curated `HABIT_ICONS` list (MaterialCommunityIcons names). Selected cell fills
  `secondaryContainer` + morph + `haptic.select`. Stores the **icon-set name key**.

### `HabitForm` 🟢 — shared add/edit form
- **Props:** `initial: HabitFormValues` (`{ name, color, icon, cadence }`), `submitLabel`,
  `onSubmit: (values) => void | Promise<void>`.
- Composes `TextField` + `ColorPicker` + `IconPicker` + `CadencePicker` in a scrollable form;
  validates (name required; weekdays ≥1 day; weekly target ≥1) with inline errors; submit button
  shows a spinner while `onSubmit` runs. Presentation-only — the routes own the
  `createHabit`/`updateHabit` call + dismissal. `NEW_HABIT_DEFAULTS` seeds a new habit. Lives in
  `src/ui/habit/` so `habit/new.tsx` and `habit/edit/[id].tsx` stay thin (architecture §3).

### `CompletionSummary` 🟢 — Today header
- **Props:** `done`, `total`, `date` (pre-formatted, e.g. "Thursday, Jul 23").
- Composes `ProgressRing` (with a `done/total` center label) + `title.large` date + count. When
  `done === total && total > 0` the count line is replaced by a `headline.large` primary-color
  "All done!"; the ring's own 100% pop + `haptic.celebrate` fire from `ProgressRing`. Presentation-
  only (the screen derives `done`/`total`/`date`).

---

## Settings components (`src/ui/settings/`)

Neutral (non-habit-accent) building blocks for the Settings tab (build-plan Phase 7). They use
only M3 surface/role tokens — a settings screen is neutral chrome, not habit-tinted (ui-rules §7,
"one accent per surface").

### `SettingsSection` 🟢
A titled group of rows.
- **Props:** `title?: string`, `children`, `footer?: string`.
- **Render:** an optional `label.large` `onSurfaceVariant` section title, then a `Surface`
  (`level={1}`, `radius.lg`) wrapping the rows with `outlineVariant` hairline dividers between
  them; an optional `body.medium` `onSurfaceVariant` footer note beneath. Spacing from `space`.

### `SettingsRow` 🟢
One row inside a section: a leading label (+ optional description) and a trailing control slot.
- **Props:** `label: string`, `description?: string`, `icon?: IconName`, `right?: ReactNode`
  (the control — e.g. a `SegmentedControl`, `Chip`, value text, or chevron), `onPress?`
  (makes the whole row a `Pressable` → for action rows like Export/Import/About),
  `accessibilityLabel?`, `accessibilityHint?`.
- **Render:** `title.medium` label over an optional `body.medium` `onSurfaceVariant` description,
  trailing `right`. When `onPress` is set the row is a `Pressable` (≥48dp, press scale + haptic).
  When a control (`right`) is interactive the row is NOT pressable (control owns the interaction).
- **Rules:** tokens/roles only; no habit accent. Full-width controls (segmented) may render on
  their own line below the label via the row's vertical layout.

### `AccentPicker` — REUSE `ColorPicker` (habit components)
The accent-key preference reuses the existing `ColorPicker` 🟢 (`value: HabitColorKey`,
`onChange`). No new component. It is the single grid of the 8 habit swatches; the chosen key is
persisted as the app accent preference. (Accent's *effect* is scoped for v1 — see the Phase-7
handoff for exactly what the accent pref drives.)

---

## Adding a component (reminder)

1. Confirm it isn't already here.
2. Add its spec row above (props, variants, tokens it uses, motion/haptic/a11y).
3. Add any missing tokens to [ui-tokens.md](./ui-tokens.md).
4. Build it, then flip its status to 🟢.
