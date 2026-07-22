# UI Tokens — Happit

> The concrete design values. **These are the only allowed sources for color, type, shape,
> spacing, and motion in the codebase.** Component code references token names; it never
> inlines a value. When a value must change, it changes here once.

How tokens reach the code:
- Color roles are emitted as **CSS variables** on the root (light + dark blocks) and
  consumed by NativeWind via `tailwind.config.js` (`colors: { primary: 'var(--primary)' … }`)
  and by JS via a `useTheme()` hook. One `darkMode: 'class'` switch flips them.
- Non-color tokens (spacing, radius, type, motion) live in `src/theme/tokens.ts` and are
  mirrored into `tailwind.config.js` so `className` and JS both see the same numbers.

Rules that govern these tokens are in [ui-rules.md](./ui-rules.md).

> ⚠️ **Palette values below are the M3-structured starting point.** They are real,
> AA-checked defaults, but the accent hue is meant to be finalized when the app is themed.
> The *structure* (roles, tone steps) is fixed; the exact hex can be regenerated from a
> source color with the Material Theme Builder and pasted back here.

---

## 1. Color

### 1.1 Semantic roles (M3)

We use Material 3 color **roles**, not raw colors. Each role has a light and dark value.
Draw text/icons using the paired `on…` role only.

| Role | Purpose |
| --- | --- |
| `primary` / `onPrimary` | Main interactive accent (active check, FAB, primary btn) |
| `primaryContainer` / `onPrimaryContainer` | Tonal accent container (chips, highlights) |
| `secondary` / `onSecondary` | Secondary accents |
| `secondaryContainer` / `onSecondaryContainer` | Secondary tonal container |
| `tertiary` / `onTertiary` | Accent for contrast moments (celebration) |
| `error` / `onError` | Errors, destructive |
| `errorContainer` / `onErrorContainer` | Missed-day tint, soft error surfaces |
| `background` / `onBackground` | App base |
| `surface` / `onSurface` | Default surface & its text |
| `onSurfaceVariant` | Low-emphasis text, icons, outlines-of-text |
| `surfaceContainerLowest` … `surfaceContainerHighest` | Tonal elevation ladder (5 steps) |
| `outline` / `outlineVariant` | Borders, dividers |
| `inverseSurface` / `inverseOnSurface` | Snackbars, inverted chips |

### 1.2 Values (CSS variables)

```css
/* global.css — light is default, dark under .dark (NativeWind darkMode: 'class') */
:root {
  --primary: #386a20;            --on-primary: #ffffff;
  --primary-container: #b7f397;  --on-primary-container: #042100;
  --secondary: #55624c;          --on-secondary: #ffffff;
  --secondary-container: #d9e7cb; --on-secondary-container: #131f0d;
  --tertiary: #386667;           --on-tertiary: #ffffff;
  --error: #ba1a1a;              --on-error: #ffffff;
  --error-container: #ffdad6;     --on-error-container: #410002;

  --background: #fdfcf5;         --on-background: #1a1c18;
  --surface: #fdfcf5;           --on-surface: #1a1c18;
  --on-surface-variant: #43483e; --outline: #74796d; --outline-variant: #c3c8bb;

  --surface-container-lowest: #ffffff;
  --surface-container-low: #f4f4ec;
  --surface-container: #eeeee6;
  --surface-container-high: #e8e9e1;
  --surface-container-highest: #e3e3db;

  --inverse-surface: #2f312c;   --inverse-on-surface: #f1f1e9;
}

.dark {
  --primary: #9cd67d;            --on-primary: #0a3900;
  --primary-container: #205107;  --on-primary-container: #b7f397;
  --secondary: #bdcbb0;          --on-secondary: #283420;
  --secondary-container: #3e4a35; --on-secondary-container: #d9e7cb;
  --tertiary: #a0cfd0;          --on-tertiary: #003738;
  --error: #ffb4ab;             --on-error: #690005;
  --error-container: #93000a;     --on-error-container: #ffdad6;

  --background: #1a1c18;        --on-background: #e3e3db;
  --surface: #1a1c18;           --on-surface: #e3e3db;
  --on-surface-variant: #c3c8bb; --outline: #8d9285; --outline-variant: #43483e;

  --surface-container-lowest: #0f120d;
  --surface-container-low: #1a1c18;
  --surface-container: #1e201c;
  --surface-container-high: #282b26;
  --surface-container-highest: #333630;

  --inverse-surface: #e3e3db;   --inverse-on-surface: #2f312c;
}
```

### 1.3 Per-habit color palettes

A habit's `color` column stores a **key** from this set. Each key maps to a
container/on-container/accent triple (light & dark) so any habit color sits naturally in
the UI. Keep the set small and distinct.

| Key | Meaning of use |
| --- | --- |
| `green` | default / health |
| `blue` | focus / study |
| `orange` | energy / fitness |
| `purple` | creativity |
| `red` | important / caution |
| `teal` | calm / mindfulness |
| `pink` | social |
| `yellow` | fun |

> Implementation: a `HABIT_PALETTES: Record<HabitColorKey, {container, onContainer, accent}>`
> per scheme in `src/theme/habitColors.ts`. Never store hex in the DB.

## 2. Typography

Scale = Material 3 type scale. `family` defaults to the platform system font (SF / Roboto);
a display font may be swapped in later at the `display`/`headline` roles only.

| Token (role) | Size / Line | Weight | Use |
| --- | --- | --- | --- |
| `display.large` | 57 / 64 | 400 | (unused v1) |
| `display.medium` | 45 / 52 | 400 | Hero streak number |
| `headline.large` | 32 / 40 | 400 | Empty-state / "All done!" |
| `headline.medium` | 28 / 36 | 500 | Section heroes |
| `title.large` | 22 / 28 | 500 | Screen titles |
| `title.medium` | 16 / 24 | 500 | Card title (habit name) |
| `body.large` | 16 / 24 | 400 | Primary body |
| `body.medium` | 14 / 20 | 400 | Secondary body |
| `label.large` | 14 / 20 | 500 | Buttons |
| `label.medium` | 12 / 16 | 500 | Chips, metadata (streak) |
| `label.small` | 11 / 16 | 500 | Tab labels, fine print |

**Emphasized weights** (Expressive): for hero numbers, use weight `700` of the display/
headline role (token `…emphasized`). Type must scale with OS dynamic type — sizes above are
the base at default scale.

## 3. Shape (corner radius)

| Token | dp | Use |
| --- | --- | --- |
| `radius.none` | 0 | — |
| `radius.xs` | 4 | inner chips, tight |
| `radius.sm` | 8 | small controls |
| `radius.md` | 12 | check control (idle), inputs |
| `radius.lg` | 16 | cards, sheets |
| `radius.xl` | 28 | large containers, modal top |
| `radius.full` | 9999 | pills, FAB, check control (active) |

The **morph** interaction animates between `radius.md` and `radius.full` (see
[ui-rules.md](./ui-rules.md) §3).

## 4. Spacing (4pt grid)

| Token | dp |
| --- | --- |
| `space.0` | 0 |
| `space.1` | 4 |
| `space.2` | 8 |
| `space.3` | 12 |
| `space.4` | 16 |
| `space.5` | 20 |
| `space.6` | 24 |
| `space.8` | 32 |
| `space.10` | 40 |
| `space.12` | 48 |
| `space.16` | 64 |

Defaults: screen padding `space.4`; card padding `space.4`; section gap `space.6`; min
touch target 48dp (`space.12`).

## 5. Elevation

Material 3 prefers **tonal** elevation (surface-container steps) over shadows. Use shadows
only for the FAB and active drag.

| Token | Surface role | Shadow |
| --- | --- | --- |
| `elevation.0` | `surface` | none |
| `elevation.1` | `surfaceContainerLow` | none |
| `elevation.2` | `surfaceContainer` | subtle (cards optional) |
| `elevation.3` | `surfaceContainerHigh` | FAB shadow |
| `elevation.dragged` | `surfaceContainerHighest` | pronounced (reorder) |

## 6. Motion

Consumed via reanimated. Defined in `src/theme/motion.ts`. **No inline spring configs.**

### 6.1 Springs

| Token | damping | stiffness | mass | Feel |
| --- | --- | --- | --- | --- |
| `motion.spring.default` | 18 | 200 | 1 | Standard settle, tiny overshoot |
| `motion.spring.bouncy` | 12 | 220 | 1 | Playful pop (check, celebrate) |
| `motion.spring.gentle` | 24 | 140 | 1 | Soft, for large surfaces |

### 6.2 Timings

| Token | ms | easing | Use |
| --- | --- | --- | --- |
| `motion.pressIn` | 90 | easeOut | scale-to-0.96 on touch |
| `motion.fast` | 150 | standard | micro cross-fades |
| `motion.medium` | 250 | standard | most transitions |
| `motion.emphasized` | 350 | emphasized | screen/hero transitions |
| `motion.enter` | 300 | emphasizedDecel | list/element entrance |

### 6.3 Stagger

| Token | value |
| --- | --- |
| `motion.stagger.item` | 40ms per item |
| `motion.stagger.max` | 240ms total cap |

### 6.4 Scale presets

| Token | value |
| --- | --- |
| `motion.scale.press` | 0.96 |
| `motion.scale.pop` | 1.08 (check success overshoot target) |

**Reduced motion:** when enabled, springs/scales are replaced by `motion.fast` cross-fades
or instant state; stagger → 0. See [ui-rules.md](./ui-rules.md) §1.5 & §4.

## 7. Haptics

Wrapper in `src/lib/haptics.ts` over `expo-haptics`. Tokens = semantic events.

| Token | expo-haptics | Trigger |
| --- | --- | --- |
| `haptic.select` | `selectionAsync` | picking a chip/option |
| `haptic.check` | `notificationAsync(Success)` | completing a habit |
| `haptic.uncheck` | `impactAsync(Light)` | undoing a check |
| `haptic.press` | `impactAsync(Light)` | primary button press |
| `haptic.celebrate` | `notificationAsync(Success)` | all-done-today |

## 8. Z-index / layering

| Token | value | Use |
| --- | --- | --- |
| `z.base` | 0 | content |
| `z.sticky` | 10 | sticky headers |
| `z.fab` | 20 | FAB |
| `z.overlay` | 30 | scrims |
| `z.modal` | 40 | sheets/dialogs |
| `z.toast` | 50 | snackbars |
