/**
 * FAB — floating action button ("add habit"). docs/ui-registry.md, docs/ui-rules.md §6.
 *
 * Lower-right, safe-area aware, `elevation.3` shadow, `z.fab`. Regular = circular pill;
 * extended = pill with a label. Press scale + haptic via Pressable.
 *
 * The FAB positions itself absolutely against the screen's bottom-right, offset by the safe
 * area so it never sits under the home indicator. (docs/ui-rules.md §6)
 */
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, shadow, space, useTheme, z, type ColorRole } from "@/theme";

import { Icon, type IconName } from "./Icon";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

export interface FABProps {
  icon: IconName;
  onPress?: () => void;
  /** Extended FAB label. */
  label?: string;
  accessibilityLabel: string;
  disabled?: boolean;
}

const ON: ColorRole = "onPrimary";

export function FAB({
  icon,
  onPress,
  label,
  accessibilityLabel,
  disabled = false,
}: FABProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const extended = label != null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      className={[
        "absolute flex-row items-center justify-center gap-2 bg-primary",
        extended ? "h-14 px-5" : "h-14 w-14",
        disabled ? "opacity-40" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        right: space[4],
        bottom: insets.bottom + space[4],
        borderRadius: extended ? radius.lg : radius.full,
        zIndex: z.fab,
        ...shadow.fab,
      }}
    >
      <Icon name={icon} size={24} colorValue={colors[ON]} />
      {extended ? (
        <Text variant="label.large" color={ON}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
