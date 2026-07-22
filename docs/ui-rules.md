# UI Rules — Material 3 Expressive for Happit

> The design law of the app. These are **principles and enforceable rules**, not
> inspiration. Every screen and component is checked against this doc. Concrete values
> (hex, ms, radii) live in [ui-tokens.md](./ui-tokens.md); this doc says *how and when* to
> use them.

Related: [ui-tokens.md](./ui-tokens.md) · [ui-registry.md](./ui-registry.md).

---

## 0. What "Material 3 Expressive" means here

Material 3 Expressive is the 2024–25 evolution of Material 3. Relative to baseline M3, it
turns up: **motion (springy, physics-based), shape (rounder, morphing on interaction),
color (bolder tonal contrast), and emphasis typography**. Our north star is that the app
feels *alive and responsive to touch* without becoming noisy.

The five pillars we commit to:

1. **Springy, physics-based motion.** Transitions use spring curves, not linear/ease.
   Things settle with a subtle overshoot, they don't just slide.
2. **Shape that responds.** Interactive surfaces morph their corner radius on press
   (e.g. a check button goes from rounded-square to circle when active). Shape is a state
   signal, not just decoration.
3. **Tonal, confident color.** Backgrounds and containers use tonal surface roles; the
   accent color carries meaning (done vs not-done). We use *fewer, bolder* colors.
4. **Expressive type.** Big, emphasized display/headline type for moments that matter
   (streak counts, "All done!"). Body stays quiet and legible.
5. **Generous, rhythmic spacing.** A 4pt grid, roomy touch targets, clear grouping.

## 1. Non-negotiable rules (the checklist every PR passes)

1. **Tokens only.** No raw hex, no magic numbers for radius/spacing/duration/font size in
   component code. Everything comes from [ui-tokens.md](./ui-tokens.md) via the theme.
   *If a value you need isn't a token, add a token — don't inline it.*
2. **Theme-driven color.** Never hardcode `#fff`/`#000` or `light`/`dark` branches inline.
   Read color roles from the theme; light/dark is one variable switch.
3. **Every interactive element has motion + haptics.** Press states animate (scale/shape)
   and fire the correct haptic (see §4). A tappable thing that does nothing on press is a
   bug.
4. **Minimum touch target 48×48 dp.** Even if the visual is smaller, the hit area isn't.
5. **Respect `prefers-reduced-motion`.** When reduced motion is on, replace spring/scale
   animations with instant or short cross-fades. Motion is never required to understand
   state.
6. **Contrast:** text on its surface meets WCAG AA (4.5:1 body, 3:1 large). The token
   pairs in [ui-tokens.md](./ui-tokens.md) are pre-checked — use the paired on-role.
7. **One accent per surface.** Don't rainbow. A screen has neutral surfaces + the habit's
   own accent for its card. Avoid mixing multiple saturated accents in one region.

## 2. Color usage rules

Colors are expressed as **M3 tonal roles**, not ad-hoc names. See the role table in
[ui-tokens.md](./ui-tokens.md) §Color.

- **Surfaces** use `surface`, `surfaceContainerLow/High/Highest` for elevation-by-tone
  (M3 uses tone, not shadow, for hierarchy). Prefer tonal elevation over heavy shadows.
- **Primary** is the app's interactive accent (used for the active check, FAB, primary
  buttons). Its `onPrimary` is the only thing drawn on top of it.
- **Per-habit color** is a *tonal palette*, not a single swatch. Each habit color key maps
  to a container/on-container/accent triple so a green habit and a red habit both look
  native to the system. Habit color tints the card container, never the whole screen.
- **State colors:** done = habit accent filled; not-done = outline/low-emphasis; missed
  (past scheduled, unchecked) = subtle `error`-tinted, never alarming red-on-red.
- **Dark mode** is a first-class, separately-tuned palette — not an inverted light theme.

## 3. Shape rules (the "morphing" part)

- Corner radii come from the shape scale in [ui-tokens.md](./ui-tokens.md) §Shape
  (`xs, sm, md, lg, xl, full`).
- **Cards** use `lg`. **Buttons/chips** use `full` (pill) unless inside a dense list.
- **Morph on state:** the primary check control animates its radius between a rounded
  square (unchecked, `md`) and a circle (`full`, checked). This morph is *the* signature
  Expressive interaction — it must be spring-animated, not a swap.
- **Selection** (e.g. selected weekday chips) morphs shape + fills tonal container, not
  just a border color change.

## 4. Motion rules

All motion uses **react-native-reanimated** with the spring/timing presets defined in
[ui-tokens.md](./ui-tokens.md) §Motion. Never inline spring configs in components.

| Interaction | Motion | Token preset |
| --- | --- | --- |
| Press-in on any button/card | Scale to ~0.96, quick | `motion.pressIn` |
| Release | Spring back with slight overshoot | `motion.spring.default` |
| Check toggle | Shape morph + fill + check-mark draw + scale pop | `motion.spring.bouncy` |
| Screen/list item enter | Staggered fade + slide-up (Layout / Entering) | `motion.enter` |
| List reorder / removal | `Layout` spring + exit fade | `motion.spring.default` |
| "All done today" | One-shot celebratory pop/scale on the progress ring | `motion.spring.bouncy` |
| Modal present | Native sheet + content fade | platform default + `motion.enter` |

Rules:
- **Duration discipline:** micro-interactions 150–250ms; screen transitions 300–400ms.
  Nothing user-blocking runs longer than 400ms.
- **Springs settle.** Overshoot is subtle (damping tuned in tokens). No bouncing 3×.
- **Stagger, don't storm.** List entrance staggers by a small per-item delay (token), caps
  the total so a long list isn't slow to appear.
- **Reduced motion** (§1.5) short-circuits all of the above to fades/instants.

## 5. Typography rules

Use the type scale in [ui-tokens.md](./ui-tokens.md) §Typography. Roles, not sizes.

- **Display / Headline** — reserved for *hero moments*: the streak number on habit detail,
  the "All done!" state, big empty-state headings. Use sparingly; that's what makes them
  feel expressive.
- **Title** — screen titles, card titles (habit name).
- **Body** — descriptions, settings rows.
- **Label** — buttons, chips, tab labels, metadata (e.g. "3 day streak").
- Emphasis via the **emphasized** weight of the scale for hero numbers; don't fake it with
  ad-hoc font sizes.

## 6. Spacing & layout rules

- **4pt grid.** All margins/paddings/gaps are multiples of 4 via spacing tokens
  (`space.1 = 4 … space.6 = 24`, etc.).
- Screen horizontal padding: `space.4` (16). Card internal padding: `space.4`.
- Vertical rhythm between sections: `space.6` (24). Between list items: `space.2`/`space.3`.
- **Safe areas** always respected (`react-native-safe-area-context`). No content under the
  status bar or home indicator.
- **Thumb-reachable primary actions.** The FAB (add habit) and the check controls sit in
  the lower two-thirds. Destructive/rare actions go top or behind an overflow.

## 7. Component-level expectations

- **HabitCard (Today):** habit accent-tinted container, name (Title), streak (Label),
  and a large trailing **CheckControl**. Whole card is not the tap target for check —
  tapping the *card body* opens detail; tapping the *CheckControl* toggles. Two distinct
  targets, both ≥48dp.
- **CheckControl:** the signature control. Idle = outlined rounded-square in habit accent;
  active = filled circle with animated check. Fires success haptic on check.
- **Progress (Today header):** an expressive ring or bar showing today's completion; pops
  when it reaches 100%.
- **Empty states:** never a bare "No data". Always an illustration/large glyph, a Headline
  line, and a primary action. See [architecture.md](./architecture.md) §8.

## 8. Accessibility (hard requirements, not nice-to-have)

- Every control has an `accessibilityLabel` and `accessibilityRole`; the CheckControl
  exposes `accessibilityState={{ checked }}`.
- Dynamic type: the type scale must scale with OS font size; layouts wrap, don't clip.
- Color is never the *only* signal — done state also changes shape/icon, not just fill.
- Hit slop brings small visuals up to the 48dp target.

## 9. How to add a new UI pattern (process)

1. Check [ui-registry.md](./ui-registry.md) — does a component already cover it?
2. If new, define it against these rules and the tokens. Add missing tokens to
   [ui-tokens.md](./ui-tokens.md) *first*.
3. Register the component in [ui-registry.md](./ui-registry.md) with its props/variants.
4. Only then build it. This keeps the system coherent instead of accreting one-offs.
