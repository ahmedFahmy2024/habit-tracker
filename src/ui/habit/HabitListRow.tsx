/**
 * HabitListRow — the Habits (manage) list item. docs/ui-registry.md.
 *
 * Denser than the Today `HabitCard`: a leading habit-accent icon chip, the name (`title.medium`)
 * and a `label.medium` cadence summary, plus a trailing **drag handle** to reorder. Tapping the
 * row body opens the edit modal. Swiping left reveals an `error`-tinted **Archive** action which
 * confirms before calling `onArchive` (docs/library-docs.md §10; archive is soft — history kept).
 *
 * Reorder + swipe both run on the installed gesture-handler 2.32 + reanimated 4.5 (APIs verified
 * from source, docs/library-docs.md §10). The row is wrapped in `ScaleDecorator` by the list so
 * `isActive` lifts it while dragging.
 */
import { useRef } from "react";
import { Alert, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import type { Habit } from "@/data/habits";
import { cadenceOf } from "@/data/habits";
import { cadenceSummary, strings } from "@/lib";
import { radius, space, useHabitColors, type HabitColorKey } from "@/theme";
import { Icon, Pressable, Text, type IconName } from "@/ui/primitives";

export interface HabitListRowProps {
  habit: Habit;
  /** Open the edit modal for this habit. */
  onEdit: () => void;
  /** Confirmed archive (soft-delete). */
  onArchive: () => void;
  /** Begin a drag-reorder (from the list's `RenderItemParams`). */
  onDrag?: () => void;
  /** True while this row is the one being dragged. */
  isActive?: boolean;
}

const ICON_CHIP = 44;

export function HabitListRow({
  habit,
  onEdit,
  onArchive,
  onDrag,
  isActive = false,
}: HabitListRowProps) {
  const swipeRef = useRef<SwipeableMethods>(null);
  const { container, onContainer } = useHabitColors(habit.color as HabitColorKey);

  const confirmArchive = () => {
    Alert.alert(
      strings.habits.archiveConfirmTitle,
      strings.habits.archiveConfirmBody,
      [
        { text: strings.common.cancel, style: "cancel", onPress: () => swipeRef.current?.close() },
        {
          text: strings.habits.archiveAction,
          style: "destructive",
          onPress: () => {
            swipeRef.current?.close();
            onArchive();
          },
        },
      ],
    );
  };

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={() => <ArchiveAction onPress={confirmArchive} />}
    >
      <Pressable
        onPress={onEdit}
        haptic={null}
        accessibilityRole="button"
        accessibilityLabel={`${strings.habits.a11yEditRow}: ${habit.name}`}
        className="flex-row items-center bg-surface-container-low"
        style={{
          gap: space[3],
          paddingHorizontal: space[4],
          paddingVertical: space[3],
          borderRadius: radius.lg,
          opacity: isActive ? 0.9 : 1,
        }}
      >
        <View
          style={{
            width: ICON_CHIP,
            height: ICON_CHIP,
            borderRadius: radius.full,
            backgroundColor: container,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={habit.icon as IconName} size={24} colorValue={onContainer} />
        </View>

        <View className="flex-1" style={{ gap: space[1] }}>
          <Text variant="title.medium" color="onSurface" numberOfLines={1}>
            {habit.name}
          </Text>
          <Text variant="label.medium" color="onSurfaceVariant" numberOfLines={1}>
            {cadenceSummary(cadenceOf(habit))}
          </Text>
        </View>

        {/* Drag handle — long-press/press begins the reorder. */}
        <Pressable
          onPressIn={onDrag}
          onLongPress={onDrag}
          haptic="select"
          scaleOnPress={false}
          disabled={!onDrag}
          accessibilityRole="button"
          accessibilityLabel={strings.habits.a11yDragHandle}
          className="items-center justify-center"
          style={{ width: space[12], height: space[12] }}
        >
          <Icon name="drag-horizontal-variant" size={24} color="onSurfaceVariant" />
        </Pressable>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

/** The revealed right-swipe action: an error-tinted Archive button. */
function ArchiveAction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      haptic="press"
      scaleOnPress={false}
      accessibilityRole="button"
      accessibilityLabel={strings.habits.archiveAction}
      className="items-center justify-center bg-error-container"
      style={{
        width: space[16],
        marginLeft: space[2],
        borderRadius: radius.lg,
      }}
    >
      <Icon name="archive-outline" size={24} color="onErrorContainer" />
      <Text variant="label.medium" color="onErrorContainer">
        {strings.habits.archiveAction}
      </Text>
    </Pressable>
  );
}
