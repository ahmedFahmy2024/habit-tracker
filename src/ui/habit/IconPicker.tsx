/**
 * IconPicker — pick a habit's icon (MaterialCommunityIcons name). docs/ui-registry.md.
 *
 * A wrap grid over a curated `HABIT_ICONS` list. The selected cell fills `secondaryContainer`
 * (or the habit accent when `colorKey` is given), morphs + scale-pops, and fires `haptic.select`.
 * Stores the icon-set NAME key (docs/ui-rules.md §2) — the DB `icon` column holds this string.
 *
 * Every name below is validated to exist in the installed MaterialCommunityIcons glyphmap.
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
  radius,
  space,
  springs,
  useHabitColors,
  useMotion,
  type HabitColorKey,
} from "@/theme";
import { Icon, Pressable, type IconName } from "@/ui/primitives";

/** Curated habit icons — a small, distinct set covering common habit domains. */
export const HABIT_ICONS = [
  "water",
  "cup-water",
  "food-apple",
  "coffee",
  "run",
  "walk",
  "bike",
  "dumbbell",
  "meditation",
  "heart-pulse",
  "sleep",
  "bed",
  "pill",
  "toothbrush",
  "book-open-variant",
  "pencil",
  "code-tags",
  "brush",
  "music",
  "guitar-acoustic",
  "camera",
  "leaf",
  "flower",
  "broom",
  "cash",
  "weather-night",
  "star",
  "calendar-check",
] as const satisfies readonly IconName[];

export type HabitIconName = (typeof HABIT_ICONS)[number];

export interface IconPickerProps {
  value: IconName;
  onChange: (name: IconName) => void;
  /** Tints the selected cell with this habit color's accent, if given. */
  colorKey?: HabitColorKey;
}

const CELL = 48;

export function IconPicker({ value, onChange, colorKey }: IconPickerProps) {
  return (
    <View className="flex-row flex-wrap" style={{ gap: space[2] }}>
      {HABIT_ICONS.map((name) => (
        <IconCell
          key={name}
          name={name}
          selected={name === value}
          colorKey={colorKey}
          onPress={() => onChange(name)}
        />
      ))}
    </View>
  );
}

function IconCell({
  name,
  selected,
  colorKey,
  onPress,
}: {
  name: HabitIconName;
  selected: boolean;
  colorKey?: HabitColorKey;
  onPress: () => void;
}) {
  const habit = useHabitColors(colorKey ?? "green");
  const { reduced, popScale } = useMotion();
  const morph = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    const target = selected ? 1 : 0;
    morph.set(reduced ? target : withSpring(target, springs.bouncy));
  }, [selected, reduced, morph]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + morph.get() * (popScale - 1) }],
  }));

  // Selected: fill with the habit accent (when a color is chosen) and draw the icon in the
  // on-accent tone; unselected: neutral surface + onSurfaceVariant.
  const accentFill = colorKey != null;

  return (
    <Pressable
      onPress={onPress}
      haptic="select"
      scaleOnPress={false}
      accessibilityRole="button"
      accessibilityLabel={`${strings.habitForm.a11yIconCell} ${name}`}
      accessibilityState={{ selected }}
    >
      <Animated.View
        className={
          selected
            ? accentFill
              ? ""
              : "bg-secondary-container"
            : "bg-surface-container"
        }
        style={[
          {
            width: CELL,
            height: CELL,
            borderRadius: radius.md,
            alignItems: "center",
            justifyContent: "center",
          },
          selected && accentFill ? { backgroundColor: habit.container } : null,
          animatedStyle,
        ]}
      >
        <Icon
          name={name}
          size={24}
          color={
            selected
              ? accentFill
                ? undefined // colorValue takes over below
                : "onSecondaryContainer"
              : "onSurfaceVariant"
          }
          colorValue={selected && accentFill ? habit.onContainer : undefined}
        />
      </Animated.View>
    </Pressable>
  );
}
