/**
 * Heatmap — the habit-detail calendar history. docs/ui-registry.md, docs/ui-rules.md §2.
 *
 * A GitHub-style grid of the habit's history: columns are weeks (Sunday at top → Saturday), the
 * newest week on the right. Rendered as a **pure View/flex grid** (not SVG) — decided Phase 6 —
 * so each cell is its own `Pressable`: a tap maps cleanly to that cell's `day` string, and a
 * `hitSlop` widens the small visual to the 48dp minimum (docs/ui-rules.md §1 rule 4) without
 * growing the cell.
 *
 * Cell fill = state, from tokens/roles only (docs/ui-tokens.md §9), never a raw hex:
 *   done → habit `accent`;  missed (past scheduled, unchecked) → subtle `errorContainer`;
 *   unscheduled → `surfaceContainerHighest`;  future / out-of-range → `surfaceContainerLow`.
 * Missed is a muted tint, never an alarming red-on-red (docs/ui-rules.md §2).
 *
 * Interaction: tapping a PAST or TODAY cell calls `onToggleDay(day)` (backfill via the caller's
 * `toggleCheckin`, docs/architecture.md §7.4) and fires the check/uncheck haptic; FUTURE days are
 * non-interactive (a plain recessed cell). The window is the last `heatmap.weeks` weeks; the
 * screen re-derives `buckets` reactively (`useHabitStats`) so a toggle updates the grid live.
 *
 * Week-start is DISPLAY-ONLY (docs/architecture.md §7.2/§7.3): the `weekStart` preference rotates
 * the weekday-row legend AND each day's row position in lockstep (`(weekday - weekStart + 7) % 7`),
 * so a Monday-first grid puts Monday at the top. `weekdayOf`, the `bucket.day` strings, and every
 * streak/schedule computation are untouched — only the on-screen row index changes.
 */
import { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";

import { weekdayOf, type DayString, type HeatmapBucket, type HeatmapState } from "@/domain";
import { formatDayShort, haptics, reorderBySunday, strings } from "@/lib";
import { usePreferences } from "@/store";
import {
  heatmap as g,
  space,
  useHabitColors,
  useTheme,
  type HabitColorKey,
} from "@/theme";
import { Pressable, Text } from "@/ui/primitives";

export interface HeatmapProps {
  /** One bucket per day in the visible window, chronological (from `heatmapBuckets`). */
  buckets: HeatmapBucket[];
  colorKey: HabitColorKey;
  /** The local "today" string, so future cells (> today) are non-interactive. */
  today: DayString;
  onToggleDay: (day: DayString) => void;
}

const ROWS = 7; // Sun..Sat
/** hitSlop that brings the small visual cell up to the 48dp minimum tap target. */
const HIT = Math.max(0, Math.round((space[12] - g.cell) / 2));

interface Cell {
  bucket: HeatmapBucket;
  future: boolean;
}

export function Heatmap({ buckets, colorKey, today, onToggleDay }: HeatmapProps) {
  const { accent } = useHabitColors(colorKey);
  const { colors } = useTheme();
  const weekStart = usePreferences((s) => s.weekStart);
  const scrollRef = useRef<ScrollView>(null);

  // Newest column is on the right; scroll it into view on mount so "now" is what you see first.
  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 0);
    return () => clearTimeout(id);
  }, []);

  // Fill by state (roles/accent only). Future/out-of-range recedes.
  const fillFor = (state: HeatmapState, future: boolean): string => {
    if (future) return colors.surfaceContainerLow;
    switch (state) {
      case "done":
        return accent;
      case "missed":
        return colors.errorContainer;
      case "unscheduled":
        return colors.surfaceContainerHighest;
    }
  };

  const stateLabel = (state: HeatmapState, future: boolean): string => {
    if (future) return strings.habitDetail.heatmapStateFuture;
    switch (state) {
      case "done":
        return strings.habitDetail.heatmapStateDone;
      case "missed":
        return strings.habitDetail.heatmapStateMissed;
      case "unscheduled":
        return strings.habitDetail.heatmapStateUnscheduled;
    }
  };

  // Bucket the days into week columns, ordered by the display week-start. Pad the leading week so
  // the first day sits in its correct display row; trailing padding fills the final partial week.
  const columns = toWeekColumns(buckets, today, weekStart);
  // The legend initials rotate in lockstep with the row order (display-only).
  const legend = reorderBySunday(strings.habitDetail.heatmapWeekdays, weekStart);

  return (
    <View className="flex-row" style={{ gap: space[2] }}>
      {/* Weekday-initial legend down the left, aligned to the grid rows (week-start ordered). */}
      <View style={{ gap: g.gap, paddingTop: 0 }}>
        {legend.map((d, i) => (
          <View
            key={i}
            style={{ height: g.cell, width: g.cell, justifyContent: "center", alignItems: "center" }}
          >
            {/* Only label alternating rows to avoid clutter (Mon/Wed/Fri). */}
            {i % 2 === 1 && (
              <Text variant="label.small" color="onSurfaceVariant">
                {d}
              </Text>
            )}
          </View>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: "row", gap: g.gap }}
      >
        {columns.map((week, ci) => (
          <View key={ci} style={{ gap: g.gap }}>
            {week.map((cell, ri) => {
              if (!cell) {
                // Padding slot (before the first day / after today) — an empty spacer.
                return <View key={ri} style={{ width: g.cell, height: g.cell }} />;
              }
              const { bucket, future } = cell;
              const fill = fillFor(bucket.state, future);
              const checked = bucket.state === "done";
              const a11yLabel = strings.habitDetail.a11yHeatmapCell(
                formatDayShort(bucket.day),
                stateLabel(bucket.state, future),
              );

              if (future) {
                // Non-interactive: a plain recessed cell.
                return (
                  <View
                    key={ri}
                    style={{
                      width: g.cell,
                      height: g.cell,
                      borderRadius: g.radius,
                      backgroundColor: fill,
                    }}
                  />
                );
              }

              return (
                <Pressable
                  key={ri}
                  onPress={() => {
                    onToggleDay(bucket.day);
                    if (checked) haptics.uncheck();
                    else haptics.check();
                  }}
                  haptic={null}
                  scaleOnPress={false}
                  hitSlop={HIT}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  accessibilityLabel={a11yLabel}
                  style={{
                    width: g.cell,
                    height: g.cell,
                    borderRadius: g.radius,
                    backgroundColor: fill,
                  }}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * Split chronological buckets into week columns ordered by `weekStart`. `null` slots pad the
 * leading week (so day 1 lands on its correct display row) and the trailing partial week up to 7
 * rows. Pure layout.
 *
 * `weekStart` shifts only the DISPLAY row: a day's row = `(weekdayOf(day) - weekStart + 7) % 7`.
 * The domain weekday number (`weekdayOf`) is unchanged — this rotates where the cell is drawn,
 * nothing else (docs/architecture.md §7.2/§7.3).
 */
function toWeekColumns(
  buckets: HeatmapBucket[],
  today: DayString,
  weekStart: 0 | 1,
): (Cell | null)[][] {
  if (buckets.length === 0) return [];
  const displayRow = (day: DayString) => (weekdayOf(day) - weekStart + ROWS) % ROWS;

  const columns: (Cell | null)[][] = [];
  let current: (Cell | null)[] = [];

  // Lead padding: empty slots for the display-rows before the first bucket's display-row.
  const firstRow = displayRow(buckets[0].day);
  for (let i = 0; i < firstRow; i++) current.push(null);

  for (const bucket of buckets) {
    current.push({ bucket, future: bucket.day > today });
    if (current.length === ROWS) {
      columns.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    while (current.length < ROWS) current.push(null);
    columns.push(current);
  }
  return columns;
}
