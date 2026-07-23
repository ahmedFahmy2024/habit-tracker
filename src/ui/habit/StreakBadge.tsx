/**
 * StreakBadge — the habit-detail streak hero. docs/ui-registry.md, docs/ui-rules.md §5.
 *
 * Presentation only: it renders already-computed `current`/`best` numbers (all streak math
 * lives in the `useHabitStats(id, today)` data hook, memoized per docs/architecture.md §9 — the
 * badge never computes). The **current** streak is the hero: `display.medium` emphasized
 * (docs/ui-tokens.md §2 hero weight), tinted with the habit accent, over a `label.large` unit
 * caption ("day streak" / "week streak"). A `label.medium` "Best: N" line sits beneath. At a
 * zero current streak it reads a quiet "No streak yet" (no scary "🔥 0", matching the Today card).
 *
 * Habit accent is the raw palette value via `useHabitColors` (a per-habit tint can't be a global
 * M3 className role — docs/ui-tokens.md §1.3), applied through `style`.
 */
import { View } from "react-native";

import { strings } from "@/lib";
import { space, useHabitColors, type HabitColorKey } from "@/theme";
import { Text } from "@/ui/primitives";
import type { StreakUnit } from "@/data/habitStats";

export interface StreakBadgeProps {
  current: number;
  best: number;
  unit: StreakUnit;
  colorKey: HabitColorKey;
}

export function StreakBadge({ current, best, unit, colorKey }: StreakBadgeProps) {
  const { accent } = useHabitColors(colorKey);

  const hasStreak = current > 0;
  const unitCaption =
    unit === "weeks"
      ? strings.habitDetail.streakUnitWeeks
      : strings.habitDetail.streakUnitDays;
  const bestLine =
    unit === "weeks"
      ? strings.habitDetail.bestWeeks(best)
      : strings.habitDetail.bestDays(best);
  const a11y =
    unit === "weeks"
      ? strings.habitDetail.a11yStreakWeeks(current, best)
      : strings.habitDetail.a11yStreakDays(current, best);

  return (
    <View
      className="items-center"
      style={{ gap: space[1] }}
      accessibilityRole="text"
      accessibilityLabel={a11y}
    >
      {hasStreak ? (
        <>
          <View
            className="flex-row items-baseline"
            style={{ gap: space[2] }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Text variant="body.large">🔥</Text>
            <Text variant="display.medium" emphasized style={{ color: accent }}>
              {current}
            </Text>
          </View>
          <Text
            variant="label.large"
            color="onSurfaceVariant"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {unitCaption}
          </Text>
        </>
      ) : (
        <Text
          variant="headline.medium"
          color="onSurfaceVariant"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {strings.habitDetail.noStreak}
        </Text>
      )}
      <Text
        variant="label.medium"
        color="onSurfaceVariant"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {bestLine}
      </Text>
    </View>
  );
}
