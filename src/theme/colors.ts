/**
 * JS mirror of the M3 color roles in src/global.css / docs/ui-tokens.md §1.2.
 *
 * className-driven color (bg-surface, text-on-surface, …) is the primary path; this map is
 * only for places that need a raw value in JS: native tab bar tinting, reanimated animated
 * colors, StatusBar, and SVG/vector-icon `color` props. Keep it in sync with global.css.
 *
 * Every role from global.css is mirrored here so JS consumers have full parity with the
 * className roles — no consumer has to fall back to an inline hex. (docs/ui-rules.md §1)
 */
export const palette = {
  light: {
    primary: "#386a20",
    onPrimary: "#ffffff",
    primaryContainer: "#b7f397",
    onPrimaryContainer: "#042100",
    secondary: "#55624c",
    onSecondary: "#ffffff",
    secondaryContainer: "#d9e7cb",
    onSecondaryContainer: "#131f0d",
    tertiary: "#386667",
    onTertiary: "#ffffff",
    error: "#ba1a1a",
    onError: "#ffffff",
    errorContainer: "#ffdad6",
    onErrorContainer: "#410002",
    background: "#fdfcf5",
    onBackground: "#1a1c18",
    surface: "#fdfcf5",
    onSurface: "#1a1c18",
    onSurfaceVariant: "#43483e",
    outline: "#74796d",
    outlineVariant: "#c3c8bb",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f4f4ec",
    surfaceContainer: "#eeeee6",
    surfaceContainerHigh: "#e8e9e1",
    surfaceContainerHighest: "#e3e3db",
    inverseSurface: "#2f312c",
    inverseOnSurface: "#f1f1e9",
  },
  dark: {
    primary: "#9cd67d",
    onPrimary: "#0a3900",
    primaryContainer: "#205107",
    onPrimaryContainer: "#b7f397",
    secondary: "#bdcbb0",
    onSecondary: "#283420",
    secondaryContainer: "#3e4a35",
    onSecondaryContainer: "#d9e7cb",
    tertiary: "#a0cfd0",
    onTertiary: "#003738",
    error: "#ffb4ab",
    onError: "#690005",
    errorContainer: "#93000a",
    onErrorContainer: "#ffdad6",
    background: "#1a1c18",
    onBackground: "#e3e3db",
    surface: "#1a1c18",
    onSurface: "#e3e3db",
    onSurfaceVariant: "#c3c8bb",
    outline: "#8d9285",
    outlineVariant: "#43483e",
    surfaceContainerLowest: "#0f120d",
    surfaceContainerLow: "#1a1c18",
    surfaceContainer: "#1e201c",
    surfaceContainerHigh: "#282b26",
    surfaceContainerHighest: "#333630",
    inverseSurface: "#e3e3db",
    inverseOnSurface: "#2f312c",
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type ColorRole = keyof (typeof palette)["light"];
