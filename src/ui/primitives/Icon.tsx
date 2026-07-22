/**
 * Icon — the app's single icon primitive over @expo/vector-icons.
 *
 * Standardizes on MaterialCommunityIcons (the best fit for the M3 look, works on
 * iOS/Android/web). Icon color comes from a theme role (resolved to a raw value via
 * `useTheme`, since vector-icons take a `color` string prop, not className) or an explicit
 * override — never an inline hex at the call site. (docs/ui-rules.md §1)
 */
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { type ComponentProps } from "react";

import { useTheme, type ColorRole } from "@/theme";

/** Typed glyph names from the installed MaterialCommunityIcons set. */
export type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export interface IconProps {
  name: IconName;
  size?: number;
  /** Theme color role (default `onSurface`). */
  color?: ColorRole;
  /** Raw color override — for on-accent icons where the value is dynamic (habit accent). */
  colorValue?: string;
}

export function Icon({
  name,
  size = 24,
  color = "onSurface",
  colorValue,
}: IconProps) {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={colorValue ?? colors[color]}
    />
  );
}
