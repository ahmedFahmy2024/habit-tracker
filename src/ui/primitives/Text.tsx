/**
 * Text — the typed type-scale primitive. docs/ui-registry.md, docs/ui-rules.md §5.
 *
 * The ONLY way to render text in the app. Enforces the M3 type scale (docs/ui-tokens.md §2):
 * no component passes a raw fontSize. Scales with OS dynamic type (RN Text does this by
 * default; we never disable `allowFontScaling`). Color is a token role, default `onSurface`.
 */
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import type { ColorRole } from "@/theme";

/** Type-scale roles — docs/ui-tokens.md §2. */
export type TextVariant =
  | "display.medium"
  | "headline.large"
  | "headline.medium"
  | "title.large"
  | "title.medium"
  | "body.large"
  | "body.medium"
  | "label.large"
  | "label.medium"
  | "label.small";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** Color role token (default `onSurface`). Maps to a `text-*` className. */
  color?: ColorRole;
  /**
   * A raw color value that overrides `color` — for the ONE case a role can't express: a per-user
   * value like the global accent's on-color (docs/ui-tokens.md §1.3), mirroring `Icon.colorValue`.
   * Prefer `color` (a role) everywhere else.
   */
  colorValue?: string;
  /** Expressive emphasized weight for hero numbers (docs/ui-tokens.md §2). */
  emphasized?: boolean;
}

// variant → { size/line via arbitrary values, weight }. All numbers come from ui-tokens §2.
const VARIANT_CLASS: Record<TextVariant, string> = {
  "display.medium": "text-[45px] leading-[52px] font-normal",
  "headline.large": "text-[32px] leading-[40px] font-normal",
  "headline.medium": "text-[28px] leading-[36px] font-medium",
  "title.large": "text-[22px] leading-[28px] font-medium",
  "title.medium": "text-[16px] leading-[24px] font-medium",
  "body.large": "text-[16px] leading-[24px] font-normal",
  "body.medium": "text-[14px] leading-[20px] font-normal",
  "label.large": "text-[14px] leading-[20px] font-medium",
  "label.medium": "text-[12px] leading-[16px] font-medium",
  "label.small": "text-[11px] leading-[16px] font-medium",
};

// Color role → text className. Mirror of the M3 roles in tailwind.config.js.
const COLOR_CLASS: Partial<Record<ColorRole, string>> = {
  primary: "text-primary",
  onPrimary: "text-on-primary",
  onPrimaryContainer: "text-on-primary-container",
  secondary: "text-secondary",
  onSecondaryContainer: "text-on-secondary-container",
  tertiary: "text-tertiary",
  error: "text-error",
  onErrorContainer: "text-on-error-container",
  onBackground: "text-on-background",
  onSurface: "text-on-surface",
  onSurfaceVariant: "text-on-surface-variant",
  inverseOnSurface: "text-inverse-on-surface",
};

export function Text({
  variant = "body.large",
  color = "onSurface",
  colorValue,
  emphasized = false,
  className,
  style,
  ...rest
}: TextProps) {
  // A raw `colorValue` wins over the role className (used only for per-user accent on-colors).
  const colorClass = colorValue ? "" : (COLOR_CLASS[color] ?? "text-on-surface");
  return (
    <RNText
      className={[
        VARIANT_CLASS[variant],
        colorClass,
        emphasized ? "font-bold" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={colorValue ? [{ color: colorValue }, style] : style}
      {...rest}
    />
  );
}
