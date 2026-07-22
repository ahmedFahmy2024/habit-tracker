/**
 * Surface — the tonal-elevation container primitive. docs/ui-registry.md, docs/ui-rules.md §2.
 *
 * M3 expresses elevation with TONE (surfaceContainer steps), not shadow (docs/ui-tokens.md
 * §5). `level` picks the tonal step; shadow is reserved for the FAB / active drag, so it is
 * off here by default.
 */
import { View, type ViewProps } from "react-native";

import { radius, space, type RadiusToken, type SpaceToken } from "@/theme";

export interface SurfaceProps extends ViewProps {
  /** Tonal elevation step — docs/ui-tokens.md §5. */
  level?: 0 | 1 | 2 | 3;
  /** Corner radius token (default `lg` — cards). docs/ui-tokens.md §3. */
  radius?: RadiusToken;
  /** Inner padding token. docs/ui-tokens.md §4. */
  padding?: SpaceToken;
}

// level → tonal surface className. docs/ui-tokens.md §5.
const LEVEL_CLASS: Record<NonNullable<SurfaceProps["level"]>, string> = {
  0: "bg-surface",
  1: "bg-surface-low",
  2: "bg-surface-container",
  3: "bg-surface-high",
};

export function Surface({
  level = 0,
  radius: radiusToken = "lg",
  padding,
  style,
  className,
  ...rest
}: SurfaceProps) {
  return (
    <View
      className={[LEVEL_CLASS[level], className ?? ""].filter(Boolean).join(" ")}
      style={[
        { borderRadius: radius[radiusToken] },
        padding != null && { padding: space[padding] },
        style,
      ]}
      {...rest}
    />
  );
}
