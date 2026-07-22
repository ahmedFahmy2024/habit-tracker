/**
 * Motion presets — docs/ui-tokens.md §6, consumed via react-native-reanimated.
 *
 * Rule: components NEVER inline a spring or timing config. They import a preset here (or the
 * raw numbers from tokens.ts) so the whole app settles with one feel. (docs/ui-rules.md §4)
 *
 * Reduced motion: `useMotion()` reads reanimated's `useReducedMotion()` and, when enabled,
 * swaps springs for instant/short cross-fades and drops stagger to 0. Motion is never
 * required to understand state. (docs/ui-rules.md §1.5, §4)
 *
 * Verified against installed react-native-reanimated 4.5.0: `withSpring`/`withTiming` accept
 * `{ damping, stiffness, mass }` / `{ duration, easing }`; `Easing.bezier(...)` exists;
 * `useReducedMotion()` returns a boolean snapshot taken at app start.
 */
import { Easing, useReducedMotion } from "react-native-reanimated";
import type {
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated";

import { duration, scale, spring, stagger } from "./tokens";

/** Spring presets — docs/ui-tokens.md §6.1. */
export const springs = {
  default: spring.default as WithSpringConfig,
  bouncy: spring.bouncy as WithSpringConfig,
  gentle: spring.gentle as WithSpringConfig,
} as const;

// M3 easing curves — docs/ui-rules.md §4 / Material 3 motion spec.
const emphasized = Easing.bezier(0.2, 0, 0, 1);
const emphasizedDecelerate = Easing.bezier(0.05, 0.7, 0.1, 1);
const standard = Easing.bezier(0.2, 0, 0, 1);
const easeOut = Easing.out(Easing.quad);

/** Timing presets — docs/ui-tokens.md §6.2. */
export const timings = {
  pressIn: { duration: duration.pressIn, easing: easeOut } as WithTimingConfig,
  fast: { duration: duration.fast, easing: standard } as WithTimingConfig,
  medium: { duration: duration.medium, easing: standard } as WithTimingConfig,
  emphasized: {
    duration: duration.emphasized,
    easing: emphasized,
  } as WithTimingConfig,
  enter: {
    duration: duration.enter,
    easing: emphasizedDecelerate,
  } as WithTimingConfig,
} as const;

export { scale as scalePresets, stagger as staggerTokens };

/**
 * Reduced-motion-aware motion tokens. Call inside a component.
 *
 * When reduced motion is on, callers should read `reduced` and short-circuit spring/scale
 * animations to `timings.fast` cross-fades or instant state, and use `stagger === 0`.
 */
export function useMotion() {
  const reduced = useReducedMotion();
  return {
    reduced,
    springs,
    timings,
    /** Press scale target — 1 (no scale) when reduced motion is on. */
    pressScale: reduced ? 1 : scale.press,
    popScale: reduced ? 1 : scale.pop,
    /** Per-item list-entrance stagger (ms) — 0 when reduced motion is on. */
    staggerItem: reduced ? 0 : stagger.item,
    staggerMax: reduced ? 0 : stagger.max,
  } as const;
}
