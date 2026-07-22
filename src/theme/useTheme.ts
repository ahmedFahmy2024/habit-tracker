import { useColorScheme } from "nativewind";

import { palette, type ColorScheme } from "./colors";

/**
 * Resolves the active color scheme and its JS color values.
 *
 * NativeWind's useColorScheme() drives the `dark:` variant and the `.dark` CSS class, so
 * className-based theming flips automatically. Use the returned `colors` only when a raw
 * value is needed in JS (native tab bar, animated colors, StatusBar). Everything else
 * should use classNames. (docs/ui-rules.md §1)
 */
export function useTheme() {
  const { colorScheme } = useColorScheme();
  const scheme: ColorScheme = colorScheme === "dark" ? "dark" : "light";
  return { scheme, colors: palette[scheme] } as const;
}
