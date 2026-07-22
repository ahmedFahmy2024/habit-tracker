/**
 * IconButton — docs/ui-registry.md. 48dp target regardless of icon size; `accessibilityLabel`
 * is required (an icon has no text label). Press scale + haptic via Pressable.
 */
import { radius, type ColorRole } from "@/theme";

import { Icon, type IconName } from "./Icon";
import { Pressable } from "./Pressable";

export type IconButtonVariant = "standard" | "tonal" | "filled";

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: number;
  disabled?: boolean;
  /** Required — an icon carries no text. (docs/ui-rules.md §8) */
  accessibilityLabel: string;
}

const VARIANT: Record<IconButtonVariant, { container: string; on: ColorRole }> = {
  standard: { container: "", on: "onSurfaceVariant" },
  tonal: { container: "bg-primary-container", on: "onPrimaryContainer" },
  filled: { container: "bg-primary", on: "onPrimary" },
};

export function IconButton({
  icon,
  onPress,
  variant = "standard",
  size = 24,
  disabled = false,
  accessibilityLabel,
}: IconButtonProps) {
  const { container, on } = VARIANT[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      className={[
        "h-12 w-12 items-center justify-center",
        container,
        disabled ? "opacity-40" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ borderRadius: radius.full }}
    >
      <Icon name={icon} size={size} color={on} />
    </Pressable>
  );
}
