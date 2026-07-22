/**
 * Chip — selectable/filter chip (weekday & cadence selection). docs/ui-registry.md,
 * docs/ui-rules.md §3.
 *
 * Selection is a state SIGNAL, not just a border color: it morphs the corner radius (sm→full)
 * and fills `secondaryContainer`. The morph is spring-animated (reduced motion → instant).
 * Fires `haptic.select`. (docs/ui-tokens.md §7)
 */
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { radius, springs, useMotion, type ColorRole } from "@/theme";

import { Icon, type IconName } from "./Icon";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  disabled?: boolean;
}

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  disabled = false,
}: ChipProps) {
  const { reduced } = useMotion();
  // Morph radius: sm (unselected) ↔ full (selected). docs/ui-rules.md §3.
  const morph = useSharedValue(selected ? 1 : 0);

  // `.get()`/`.set()` (not `.value`) — React-Compiler-safe shared-value API (reactCompiler: true).
  useEffect(() => {
    const target = selected ? 1 : 0;
    morph.set(reduced ? target : withSpring(target, springs.default));
  }, [selected, reduced, morph]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderRadius: radius.sm + morph.get() * (radius.full - radius.sm),
  }));

  const on: ColorRole = selected ? "onSecondaryContainer" : "onSurfaceVariant";

  return (
    <Pressable
      onPress={onPress}
      haptic="select"
      disabled={disabled}
      scaleOnPress={false}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
    >
      <Animated.View
        style={animatedStyle}
        className={[
          "min-h-[48px] flex-row items-center justify-center gap-2 px-4",
          selected ? "bg-secondary-container" : "border border-outline",
          disabled ? "opacity-40" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {icon ? <Icon name={icon} size={18} color={on} /> : null}
        <Text variant="label.large" color={on}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
