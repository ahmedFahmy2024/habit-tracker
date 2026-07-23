/**
 * HabitCard — the Today list item. docs/ui-registry.md, docs/ui-rules.md §7.
 *
 * An accent-tinted card: leading habit icon, the name (`title.medium`), a `label.medium` streak
 * ("🔥 5"), and a trailing signature `CheckControl`. Two DISTINCT ≥48dp tap targets (ui-rules §7):
 * the card **body** opens the habit detail (`onOpen`); the **CheckControl** toggles today's
 * check-in (`onToggle`). They're siblings so their hit areas never overlap.
 *
 * Habit color is a token KEY → resolved to raw values via `useHabitColors` for the container
 * tint + icon; className color would use the global M3 roles, but a per-habit tint must be the
 * raw palette value (docs/ui-tokens §1.3). Entrance stagger is applied by the list, not here.
 */
import { View } from "react-native";

import { strings } from "@/lib";
import { radius, space, useHabitColors, type HabitColorKey } from "@/theme";
import { Icon, Pressable, Text, type IconName } from "@/ui/primitives";
import { CheckControl } from "./CheckControl";
import type { StreakUnit } from "@/data/today";
import type { Habit } from "@/data/habits";

export interface HabitCardProps {
  habit: Habit;
  checked: boolean;
  streak: number;
  streakUnit: StreakUnit;
  /** Toggle today's check-in (CheckControl target). */
  onToggle: () => void;
  /** Open the habit detail (card-body target). */
  onOpen: () => void;
}

const ICON_CHIP = 44;

export function HabitCard({
  habit,
  checked,
  streak,
  streakUnit,
  onToggle,
  onOpen,
}: HabitCardProps) {
  const colorKey = habit.color as HabitColorKey;
  const { container, onContainer } = useHabitColors(colorKey);

  const streakLabel =
    streakUnit === "weeks"
      ? strings.today.streakWeeks(streak)
      : strings.today.streakDays(streak);
  const streakA11y =
    streakUnit === "weeks"
      ? strings.today.a11yStreakWeeks(streak)
      : strings.today.a11yStreakDays(streak);

  return (
    <View
      className="flex-row items-center"
      style={{ gap: space[2] }}
    >
      {/* Target 1 — card body opens detail. */}
      <Pressable
        onPress={onOpen}
        haptic={null}
        accessibilityRole="button"
        accessibilityLabel={`${strings.today.a11yOpenDetail}: ${habit.name}`}
        className="flex-1 flex-row items-center"
        style={{
          gap: space[3],
          paddingHorizontal: space[4],
          paddingVertical: space[3],
          borderRadius: radius.lg,
          backgroundColor: container,
        }}
      >
        <View
          style={{
            width: ICON_CHIP,
            height: ICON_CHIP,
            borderRadius: radius.full,
            backgroundColor: onContainer,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={habit.icon as IconName} size={24} colorValue={container} />
        </View>

        <View className="flex-1" style={{ gap: space[1] }}>
          <Text
            variant="title.medium"
            numberOfLines={1}
            style={{ color: onContainer }}
          >
            {habit.name}
          </Text>
          {streak > 0 && (
            <Text
              variant="label.medium"
              numberOfLines={1}
              style={{ color: onContainer }}
              accessibilityLabel={streakA11y}
            >
              {streakLabel}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Target 2 — the signature CheckControl toggles today. */}
      <CheckControl
        checked={checked}
        onToggle={onToggle}
        colorKey={colorKey}
        label={`${strings.today.a11yToggle}: ${habit.name}`}
      />
    </View>
  );
}
