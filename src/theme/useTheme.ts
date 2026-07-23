import { useColorScheme } from "nativewind";

import { usePreferences } from "@/store";

import { palette, type ColorScheme } from "./colors";
import { habitColors, type HabitColorKey, type HabitTonalColors } from "./habitColors";

/**
 * Resolves the active color scheme and its JS color values.
 *
 * NativeWind's useColorScheme() drives the `dark:` variant and the `.dark` CSS class, so
 * className-based theming flips automatically. Use the returned `colors` only when a raw
 * value is needed in JS (native tab bar, animated colors, StatusBar, vector-icon color).
 * Everything else should use classNames. (docs/ui-rules.md §1)
 */
export function useTheme() {
  const { colorScheme } = useColorScheme();
  const scheme: ColorScheme = colorScheme === "dark" ? "dark" : "light";
  return { scheme, colors: palette[scheme] } as const;
}

/**
 * Resolves a habit's tonal palette (container / onContainer / accent) for the active scheme.
 * Use for the raw values reanimated/vector-icons need; never store or inline hex.
 * (docs/ui-tokens.md §1.3)
 */
export function useHabitColors(key: HabitColorKey): HabitTonalColors {
  const { scheme } = useTheme();
  return habitColors(scheme, key);
}

/**
 * Resolves the user's chosen **global accent** (the persisted `accentKey` preference) into its
 * tonal palette for the active scheme. This is the ONE place app chrome reads the accent, so the
 * whole app re-tints from a single preference — no inline branches (docs/ui-rules.md §1/§2).
 *
 * Scope (Phase 8 decision): the accent re-tints the neutral, non-per-habit interactive chrome —
 * the FAB, filled/tonal/outlined/text `Button`s, and the Today `ProgressRing` + "All done!"
 * header. Per-habit surfaces (habit cards, their CheckControl) keep their OWN habit color via
 * `useHabitColors`; the accent never overrides those. Returns raw values because a per-user accent
 * can't be a global M3 className role (same rationale as per-habit colors, docs/ui-tokens.md §1.3).
 */
export function useAccent(): HabitTonalColors {
  const { scheme } = useTheme();
  const accentKey = usePreferences((s) => s.accentKey);
  return habitColors(scheme, accentKey);
}
