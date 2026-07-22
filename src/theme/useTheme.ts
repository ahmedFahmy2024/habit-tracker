import { useColorScheme } from "nativewind";

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
