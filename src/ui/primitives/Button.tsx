/**
 * Button — docs/ui-registry.md, docs/ui-rules.md §3/§5.
 *
 * Pill shape (`radius.full`), `label.large` type, press scale + spring back + haptic (all via
 * Pressable). Four M3 variants. Loading swaps the label for a spinner and blocks presses.
 */
import { ActivityIndicator, View } from "react-native";

import { strings } from "@/lib";
import { radius, useAccent } from "@/theme";

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
  // Buttons carry the app's global accent (Phase 8) so every primary action re-tints from the
  // one accent preference. `accent` = saturated fill / label; `container` = tonal fill; `onAccent`
  // = content on the filled fill; `onContainer` = content on the tonal fill. (docs/ui-rules.md §2)
  const accent = useAccent();
  const isDisabled = disabled || loading;

  // variant → { backgroundColor, borderColor, content-color } from the accent palette.
  const style =
    variant === "filled"
      ? { bg: accent.accent, border: undefined as string | undefined, on: accent.onAccent }
      : variant === "tonal"
        ? { bg: accent.container, border: undefined, on: accent.onContainer }
        : variant === "outlined"
          ? { bg: undefined, border: accent.accent, on: accent.accent }
          : { bg: undefined, border: undefined, on: accent.accent }; // text

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
        fullWidth ? "self-stretch" : "self-start",
        isDisabled ? "opacity-40" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderRadius: radius.full,
        backgroundColor: style.bg,
        borderWidth: style.border ? 1 : 0,
        borderColor: style.border,
      }}
    >
      {loading ? (
        <ActivityIndicator color={style.on} accessibilityLabel={strings.a11y.loading} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon ? <Icon name={icon} size={18} colorValue={style.on} /> : null}
          <Text variant="label.large" colorValue={style.on}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
