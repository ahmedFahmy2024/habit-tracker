/**
 * SegmentedControl — a generic single-select segmented control. docs/ui-registry.md,
 * docs/ui-rules.md §3 (selection morphs shape + fills a tonal container, not just a border).
 *
 * The shared version of the pattern CadencePicker uses inline; here it's reused for the neutral
 * Settings selectors (theme mode, week-start). A `secondaryContainer` highlight pill springs
 * across the `surfaceContainer` track on change (instant under reduced motion). Tokens/roles only.
 */
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";

import { radius, space, springs, useMotion } from "@/theme";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

export interface SegmentedControlProps<T extends string> {
  segments: { key: T; label: string }[];
  selected: T;
  onSelect: (key: T) => void;
  accessibilityLabel?: string;
}

export function SegmentedControl<T extends string>({
  segments,
  selected,
  onSelect,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { reduced } = useMotion();
  const index = Math.max(
    0,
    segments.findIndex((s) => s.key === selected),
  );
  const pos = useSharedValue(index);

  useEffect(() => {
    // `.get()`/`.set()` — React-Compiler-safe shared-value API (reactCompiler: true).
    pos.set(reduced ? index : withSpring(index, springs.default));
  }, [index, reduced, pos]);

  const highlightStyle = useAnimatedStyle(() => ({
    left: `${(pos.get() * 100) / segments.length}%`,
  }));

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row bg-surface-container"
      style={{ borderRadius: radius.full, padding: space[1] }}
    >
      {/* Moving highlight pill — width = one segment. */}
      <Animated.View
        pointerEvents="none"
        className="absolute bg-secondary-container"
        style={[
          {
            top: space[1],
            bottom: space[1],
            width: `${100 / segments.length}%`,
            borderRadius: radius.full,
          },
          highlightStyle,
        ]}
      />
      {segments.map((seg) => {
        const isSelected = seg.key === selected;
        return (
          <Pressable
            key={seg.key}
            onPress={() => onSelect(seg.key)}
            haptic="select"
            scaleOnPress={false}
            className="flex-1 items-center justify-center"
            style={{ minHeight: space[10], paddingHorizontal: space[2] }}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={seg.label}
          >
            <Text
              variant="label.large"
              color={isSelected ? "onSecondaryContainer" : "onSurfaceVariant"}
              numberOfLines={1}
            >
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
