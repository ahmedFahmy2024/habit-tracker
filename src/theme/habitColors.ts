/**
 * Per-habit tonal palettes — docs/ui-tokens.md §1.3.
 *
 * A habit's `color` column stores a KEY from this set (never a hex). Each key maps to a
 * container / on-container / accent triple, tuned separately for light and dark so a green
 * habit and a red habit both sit naturally in the M3 system. (docs/ui-rules.md §2)
 *
 * - `container`  — fills the habit card surface (a low-chroma tonal container).
 * - `onContainer`— text/icons drawn on top of `container`, AA-checked against it.
 * - `accent`     — the saturated state color: the active CheckControl fill, streak accents.
 *
 * These are the ONLY source of per-habit color. Consume via `useHabitColors()` (raw values
 * for reanimated/JS) — className-based color uses the global M3 roles instead.
 */

export const HABIT_COLOR_KEYS = [
  "green",
  "blue",
  "orange",
  "purple",
  "red",
  "teal",
  "pink",
  "yellow",
] as const;

export type HabitColorKey = (typeof HABIT_COLOR_KEYS)[number];

export interface HabitTonalColors {
  /** Card container fill (low chroma). */
  container: string;
  /** Text/icons on `container` (AA-checked). */
  onContainer: string;
  /** Saturated state accent (active check, streak). */
  accent: string;
  /**
   * Text/icons drawn ON the saturated `accent` (e.g. the accent-tinted FAB / filled button).
   * Light accents are mid-tone → white is AA (≥5.5:1 across all 8 hues); dark accents are light
   * pastels → black is AA (≥12:1). Verified in Phase 8. (docs/ui-tokens.md §1.3, ui-rules §1/§6)
   */
  onAccent: string;
}

type HabitPalette = Record<HabitColorKey, HabitTonalColors>;

// Light scheme — containers are pale tonal tints; accents are mid-tone and AA on white text.
const light: HabitPalette = {
  green: { container: "#c3edb0", onContainer: "#082100", accent: "#3f6d21", onAccent: "#ffffff" },
  blue: { container: "#cfe4ff", onContainer: "#001c38", accent: "#2b5ea7", onAccent: "#ffffff" },
  orange: { container: "#ffdcc2", onContainer: "#301400", accent: "#a1531f", onAccent: "#ffffff" },
  purple: { container: "#ecdcff", onContainer: "#22005d", accent: "#7343b5", onAccent: "#ffffff" },
  red: { container: "#ffdad6", onContainer: "#410002", accent: "#b3261e", onAccent: "#ffffff" },
  teal: { container: "#bff2ef", onContainer: "#00201f", accent: "#1f6b67", onAccent: "#ffffff" },
  pink: { container: "#ffd9e2", onContainer: "#3e0018", accent: "#ab2a5d", onAccent: "#ffffff" },
  yellow: { container: "#fbe08a", onContainer: "#241a00", accent: "#7a5900", onAccent: "#ffffff" },
};

// Dark scheme — containers are deep tonal shades; accents are light/bright and AA on dark text.
const dark: HabitPalette = {
  green: { container: "#27510e", onContainer: "#c3edb0", accent: "#a8d18d", onAccent: "#000000" },
  blue: { container: "#0f477f", onContainer: "#cfe4ff", accent: "#a4c9ff", onAccent: "#000000" },
  orange: { container: "#7f3b06", onContainer: "#ffdcc2", accent: "#ffb787", onAccent: "#000000" },
  purple: { container: "#5a2b9c", onContainer: "#ecdcff", accent: "#d3bbff", onAccent: "#000000" },
  red: { container: "#8c1d18", onContainer: "#ffdad6", accent: "#ffb4ab", onAccent: "#000000" },
  teal: { container: "#00504c", onContainer: "#bff2ef", accent: "#a2d6d1", onAccent: "#000000" },
  pink: { container: "#8a134a", onContainer: "#ffd9e2", accent: "#ffb1c6", onAccent: "#000000" },
  yellow: { container: "#5c4300", onContainer: "#fbe08a", accent: "#e0c46c", onAccent: "#000000" },
};

export const HABIT_PALETTES = { light, dark } as const;

export function habitColors(
  scheme: "light" | "dark",
  key: HabitColorKey,
): HabitTonalColors {
  return HABIT_PALETTES[scheme][key];
}
