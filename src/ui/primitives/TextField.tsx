/**
 * TextField — M3 outlined text input. docs/ui-registry.md, docs/ui-rules.md §5.
 *
 * The label floats from inside the field to the top border when focused or filled, animated
 * (reduced motion → instant). Border/label recolor on focus (primary) and error (error role).
 * Error text renders below in the `error` role.
 *
 * The label's vertical/scale morph is driven by reanimated; the TextInput itself stays a
 * plain RN input so keyboard/IME behavior is untouched.
 */
import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

import { radius, space, timings, useMotion, useTheme } from "@/theme";

import { Text } from "./Text";

export interface TextFieldProps
  extends Omit<TextInputProps, "style" | "placeholderTextColor"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  maxLength?: number;
  autoFocus?: boolean;
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  maxLength,
  autoFocus,
  ...rest
}: TextFieldProps) {
  const { colors } = useTheme();
  const { reduced } = useMotion();
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  // Progress 0 (resting, inside field) → 1 (floated to the border).
  const progress = useDerivedValue(() => {
    const target = floated ? 1 : 0;
    return reduced ? target : withTiming(target, timings.fast);
  }, [floated, reduced]);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -14 * progress.get() },
      { scale: 1 - 0.25 * progress.get() },
    ],
  }));

  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.outline;
  const labelColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.onSurfaceVariant;

  return (
    <View className="self-stretch">
      <View
        className="justify-center bg-surface px-4"
        style={{
          minHeight: space[12],
          borderRadius: radius.md,
          borderWidth: focused || error ? 2 : 1,
          borderColor,
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              left: space[4],
              // origin at left so the scale shrinks toward the start
              transformOrigin: "left",
            },
            labelStyle,
          ]}
        >
          <Text variant="body.large" style={{ color: labelColor }}>
            {label}
          </Text>
        </Animated.View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          maxLength={maxLength}
          accessibilityLabel={label}
          className="text-[16px] leading-[24px] text-on-surface"
          style={{ paddingTop: space[2], paddingBottom: space[1] }}
          {...rest}
        />
      </View>
      {error ? (
        <Text variant="body.medium" color="error" style={{ marginTop: space[1], marginLeft: space[4] }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
