/**
 * Button — docs/ui-registry.md, docs/ui-rules.md §3/§5.
 *
 * Pill shape (`radius.full`), `label.large` type, press scale + spring back + haptic (all via
 * Pressable). Four M3 variants. Loading swaps the label for a spinner and blocks presses.
 */
import { ActivityIndicator, View } from "react-native";

import { strings } from "@/lib";
import { radius, useTheme, type ColorRole } from "@/theme";

import { Icon, type IconName } from "./Icon";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

export type ButtonVariant = "filled" | "tonal" | "outlined" | "text";

export interface ButtonProps {
  variant?: ButtonVariant;
  label: string;
  icon?: IconName;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

// variant → container className + the on-color role its label/icon/spinner use.
const VARIANT: Record<
  ButtonVariant,
  { container: string; on: ColorRole }
> = {
  filled: { container: "bg-primary", on: "onPrimary" },
  tonal: { container: "bg-primary-container", on: "onPrimaryContainer" },
  outlined: { container: "border border-outline", on: "primary" },
  text: { container: "", on: "primary" },
};

export function Button({
  variant = "filled",
  label,
  icon,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) {
  const { colors } = useTheme();
  const { container, on } = VARIANT[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={[
        "flex-row items-center justify-center gap-2 px-6",
        // 48dp min target height; pill shape via radius.full on style below.
        "min-h-[48px]",
        container,
        fullWidth ? "self-stretch" : "self-start",
        isDisabled ? "opacity-40" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ borderRadius: radius.full }}
    >
      {loading ? (
        <ActivityIndicator
          color={colors[on]}
          accessibilityLabel={strings.a11y.loading}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon ? <Icon name={icon} size={18} color={on} /> : null}
          <Text variant="label.large" color={on}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
