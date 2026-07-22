/**
 * Non-color design tokens — mirror of docs/ui-tokens.md (§3 shape, §4 spacing, §6 motion).
 * Color roles live as CSS variables in src/global.css and are consumed via NativeWind
 * classNames (e.g. bg-surface). These JS tokens are for animated/dynamic values that can't
 * be expressed as a static className.
 *
 * Rule: components read from here — they never inline magic numbers. (docs/ui-rules.md §1)
 */

// docs/ui-tokens.md §4 — 4pt grid
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// docs/ui-tokens.md §3 — shape scale (dp)
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,
  full: 9999,
} as const;

// docs/ui-tokens.md §6.1 — reanimated spring presets
export const spring = {
  default: { damping: 18, stiffness: 200, mass: 1 },
  bouncy: { damping: 12, stiffness: 220, mass: 1 },
  gentle: { damping: 24, stiffness: 140, mass: 1 },
} as const;

// docs/ui-tokens.md §6.2 — timing durations (ms)
export const duration = {
  pressIn: 90,
  fast: 150,
  medium: 250,
  emphasized: 350,
  enter: 300,
} as const;

// docs/ui-tokens.md §6.4 — scale presets
export const scale = {
  press: 0.96,
  pop: 1.08,
} as const;

// docs/ui-tokens.md §6.3 — list entrance stagger
export const stagger = {
  item: 40,
  max: 240,
} as const;

export type SpaceToken = keyof typeof space;
export type RadiusToken = keyof typeof radius;
