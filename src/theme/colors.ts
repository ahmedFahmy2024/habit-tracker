/**
 * JS mirror of the M3 color roles in src/global.css / docs/ui-tokens.md §1.2.
 *
 * className-driven color (bg-surface, text-on-surface, …) is the primary path; this map is
 * only for places that need a raw value in JS: native tab bar tinting, reanimated animated
 * colors, and StatusBar. Keep it in sync with global.css.
 */
export const palette = {
  light: {
    primary: "#386a20",
    onPrimary: "#ffffff",
    primaryContainer: "#b7f397",
    onPrimaryContainer: "#042100",
    secondary: "#55624c",
    onSecondary: "#ffffff",
    tertiary: "#386667",
    error: "#ba1a1a",
    errorContainer: "#ffdad6",
    background: "#fdfcf5",
    onBackground: "#1a1c18",
    surface: "#fdfcf5",
    onSurface: "#1a1c18",
    onSurfaceVariant: "#43483e",
    outline: "#74796d",
    outlineVariant: "#c3c8bb",
    surfaceContainer: "#eeeee6",
    surfaceContainerHigh: "#e8e9e1",
  },
  dark: {
    primary: "#9cd67d",
    onPrimary: "#0a3900",
    primaryContainer: "#205107",
    onPrimaryContainer: "#b7f397",
    secondary: "#bdcbb0",
    onSecondary: "#283420",
    tertiary: "#a0cfd0",
    error: "#ffb4ab",
    errorContainer: "#93000a",
    background: "#1a1c18",
    onBackground: "#e3e3db",
    surface: "#1a1c18",
    onSurface: "#e3e3db",
    onSurfaceVariant: "#c3c8bb",
    outline: "#8d9285",
    outlineVariant: "#43483e",
    surfaceContainer: "#1e201c",
    surfaceContainerHigh: "#282b26",
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type ColorRole = keyof (typeof palette)["light"];
