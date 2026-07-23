/**
 * CadencePicker — choose a habit's cadence. docs/ui-registry.md, docs/architecture.md §4/§7.2.
 *
 * A segmented control (Daily / Weekdays / Times-per-week) drives which sub-control shows:
 *   • Weekdays → 7 weekday `Chip`s (Sunday-first display; index == Weekday 0=Sun..6=Sat).
 *   • Times/week → a −N+ stepper (1..7).
 * It emits the normalized domain `Cadence` union; the data layer's `cadenceColumns` flattens
 * it to the DB columns. Selecting a segment/chip fires `haptic.select` (via `Chip`/`Pressable`).
 *
 * Week-start is a DISPLAY concern only (docs/architecture.md §7.2). No pref store exists yet
 * (Phase 7), so display defaults to Sunday-first; the Weekday NUMBERS emitted are unaffected.
 */
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { strings, WEEKDAY_DISPLAY_ORDER } from "@/lib";
import type { Cadence, Weekday } from "@/domain";
import { radius, space, springs, useMotion } from "@/theme";
import { Chip, Icon, Pressable, Text } from "@/ui/primitives";

export interface CadencePickerProps {
  value: Cadence;
  onChange: (cadence: Cadence) => void;
}

const WEEKLY_MIN = 1;
const WEEKLY_MAX = 7;

type SegmentKey = Cadence["type"];

const SEGMENTS: { key: SegmentKey; label: string }[] = [
  { key: "daily", label: strings.cadence.daily },
  { key: "weekdays", label: strings.cadence.weekdays },
  { key: "weekly_count", label: strings.cadence.weeklyCount },
];

export function CadencePicker({ value, onChange }: CadencePickerProps) {
  // Switching segment produces a sensible default for that cadence type.
  const selectSegment = (key: SegmentKey) => {
    if (key === value.type) return;
    switch (key) {
      case "daily":
        return onChange({ type: "daily" });
      case "weekdays":
        return onChange({
          type: "weekdays",
          weekdays: value.type === "weekdays" ? value.weekdays : [1, 2, 3, 4, 5],
        });
      case "weekly_count":
        return onChange({
          type: "weekly_count",
          weeklyTarget:
            value.type === "weekly_count" ? value.weeklyTarget : 3,
        });
    }
  };

  return (
    <View style={{ gap: space[4] }}>
      <SegmentedControl selected={value.type} onSelect={selectSegment} />
      {value.type === "weekdays" ? (
        <WeekdayChips
          selected={value.weekdays}
          onToggle={(day) =>
            onChange({ type: "weekdays", weekdays: toggleWeekday(value.weekdays, day) })
          }
        />
      ) : null}
      {value.type === "weekly_count" ? (
        <WeeklyStepper
          target={value.weeklyTarget}
          onChange={(weeklyTarget) => onChange({ type: "weekly_count", weeklyTarget })}
        />
      ) : null}
    </View>
  );
}

/** Toggle a weekday in a readonly list, keeping it sorted + de-duplicated. */
function toggleWeekday(
  current: readonly Weekday[],
  day: Weekday,
): readonly Weekday[] {
  const set = new Set(current);
  if (set.has(day)) set.delete(day);
  else set.add(day);
  return [...set].sort((a, b) => a - b);
}

/* ------------------------------------------------------------------ segmented control */

function SegmentedControl({
  selected,
  onSelect,
}: {
  selected: SegmentKey;
  onSelect: (key: SegmentKey) => void;
}) {
  const { reduced } = useMotion();
  const index = SEGMENTS.findIndex((s) => s.key === selected);
  // Animate the highlight pill across the track (fraction 0..n-1).
  const pos = useSharedValue(index);

  useEffect(() => {
    pos.set(reduced ? index : withSpring(index, springs.default));
  }, [index, reduced, pos]);

  const highlightStyle = useAnimatedStyle(() => ({
    left: `${(pos.get() * 100) / SEGMENTS.length}%`,
  }));

  return (
    <View
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
            width: `${100 / SEGMENTS.length}%`,
            borderRadius: radius.full,
          },
          highlightStyle,
        ]}
      />
      {SEGMENTS.map((seg) => {
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

/* ------------------------------------------------------------------ weekday chips */

function WeekdayChips({
  selected,
  onToggle,
}: {
  selected: readonly Weekday[];
  onToggle: (day: Weekday) => void;
}) {
  const set = new Set(selected);
  return (
    <View className="flex-row flex-wrap" style={{ gap: space[2] }}>
      {WEEKDAY_DISPLAY_ORDER.map((day) => (
        <Chip
          key={day}
          label={strings.cadence.weekdayShort[day]}
          selected={set.has(day)}
          onPress={() => onToggle(day)}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ weekly stepper */

function WeeklyStepper({
  target,
  onChange,
}: {
  target: number;
  onChange: (value: number) => void;
}) {
  const clamped = Math.min(WEEKLY_MAX, Math.max(WEEKLY_MIN, target));
  const canDec = clamped > WEEKLY_MIN;
  const canInc = clamped < WEEKLY_MAX;

  return (
    <View
      className="flex-row items-center self-start bg-surface-container"
      style={{ borderRadius: radius.full, padding: space[1], gap: space[2] }}
    >
      <StepperButton
        icon="minus"
        disabled={!canDec}
        onPress={() => onChange(clamped - 1)}
        accessibilityLabel={strings.cadence.stepperDecrement}
      />
      <View className="items-center" style={{ minWidth: space[16] }}>
        <Text variant="title.large" color="onSurface">
          {clamped}
        </Text>
        <Text variant="label.medium" color="onSurfaceVariant">
          {strings.cadence.perWeekLabel}
        </Text>
      </View>
      <StepperButton
        icon="plus"
        disabled={!canInc}
        onPress={() => onChange(clamped + 1)}
        accessibilityLabel={strings.cadence.stepperIncrement}
      />
    </View>
  );
}

function StepperButton({
  icon,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  icon: "plus" | "minus";
  onPress: () => void;
  disabled: boolean;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      haptic="select"
      className="items-center justify-center bg-surface"
      style={{ width: space[12], height: space[12], borderRadius: radius.full }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <Icon
        name={icon}
        size={24}
        color={disabled ? "onSurfaceVariant" : "onSurface"}
      />
    </Pressable>
  );
}
