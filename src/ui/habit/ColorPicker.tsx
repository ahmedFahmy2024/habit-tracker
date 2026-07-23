/**
 * ColorPicker — pick a habit's color KEY. docs/ui-registry.md, docs/ui-tokens.md §1.3.
 *
 * A wrap grid of the 8 habit color swatches (each the palette `accent` for the active scheme).
 * Selecting morphs the swatch (ring + scale pop, `springs.bouncy`) and fires `haptic.select`.
 * Stores the KEY (`green`, `blue`, …) — never a hex (docs/ui-rules.md §2).
 */
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { View } from "react-native";
import { useEffect } from "react";

import { strings } from "@/lib";
import {
  HABIT_COLOR_KEYS,
  radius,
  space,
  springs,
  useHabitColors,
  useMotion,
  useTheme,
  type HabitColorKey,
} from "@/theme";
import { Icon, Pressable } from "@/ui/primitives";

export interface ColorPickerProps {
  value: HabitColorKey;
  onChange: (key: HabitColorKey) => void;
}

const SWATCH = 44; // visual size; Pressable hitSlop lifts the target to ≥48dp

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <View className="flex-row flex-wrap" style={{ gap: space[3] }}>
      {HABIT_COLOR_KEYS.map((key) => (
        <Swatch
          key={key}
          colorKey={key}
          selected={key === value}
          onPress={() => onChange(key)}
        />
      ))}
    </View>
  );
}

function Swatch({
  colorKey,
  selected,
  onPress,
}: {
  colorKey: HabitColorKey;
  selected: boolean;
  onPress: () => void;
}) {
  const { accent, onContainer } = useHabitColors(colorKey);
  const { colors } = useTheme();
  const { reduced, popScale } = useMotion();
  const morph = useSharedValue(selected ? 1 : 0);

  // `.get()`/`.set()` — React-Compiler-safe shared-value API (reactCompiler: true).
  useEffect(() => {
    const target = selected ? 1 : 0;
    morph.set(reduced ? target : withSpring(target, springs.bouncy));
  }, [selected, reduced, morph]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + morph.get() * (popScale - 1) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      haptic="select"
      scaleOnPress={false}
      accessibilityRole="button"
      accessibilityLabel={`${strings.habitForm.a11yColorSwatch} ${colorKey}`}
      accessibilityState={{ selected }}
    >
      <Animated.View
        style={[
          {
            width: SWATCH,
            height: SWATCH,
            borderRadius: radius.full,
            backgroundColor: accent,
            alignItems: "center",
            justifyContent: "center",
            // selection ring: a tonal outline that reads in both schemes
            borderWidth: selected ? 3 : 0,
            borderColor: colors.onSurface,
          },
          animatedStyle,
        ]}
      >
        {selected ? (
          <Icon name="check" size={22} colorValue={onContainer} />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}
