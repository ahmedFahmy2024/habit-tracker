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

// docs/ui-tokens.md §9 — heatmap calendar geometry (habit detail). GitHub-style cells are
// deliberately smaller than the 4pt content grid, so the cell/gap/radius live as named tokens
// here rather than being inlined (docs/ui-rules.md §1). The cell's TAP target is widened to
// 48dp via hitSlop in the component, not by growing the visual.
export const heatmap = {
  cell: 14, // visual cell edge (dp)
  gap: 3, // gap between cells (dp)
  radius: 3, // cell corner radius (dp)
  weeks: 26, // visible window: last N ISO-ish weeks (columns)
} as const;

// docs/ui-tokens.md §8 — z-index / layering
export const z = {
  base: 0,
  sticky: 10,
  fab: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

// docs/ui-tokens.md §5 — shadows. M3 prefers tonal elevation; real shadow is reserved for
// the FAB and active drag. RN shadow props (iOS) + elevation (Android) kept in sync.
export const shadow = {
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  dragged: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 12,
  },
} as const;

export type SpaceToken = keyof typeof space;
export type RadiusToken = keyof typeof radius;
