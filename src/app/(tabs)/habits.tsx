import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  archiveHabit,
  reorderHabits,
  useHabits,
  type Habit,
} from "@/data/habits";
import { space } from "@/theme";
import { strings } from "@/lib";
import { EmptyState, FAB } from "@/ui/primitives";
import { HabitListRow } from "@/ui/habit";

/**
 * Habits — manage the full list (docs/project-overview.md §6, build-plan §Phase 4).
 *
 * Live list from `useHabits` rendered as a reorderable `DraggableFlatList` (drag handle per
 * row → persist `sortOrder` via `reorderHabits`; docs/library-docs.md §10). Each row swipes to
 * archive and taps to edit. Empty state + FAB when there are no habits.
 */
export default function HabitsScreen() {
  const router = useRouter();
  const { data: habits } = useHabits();

  const openNew = useCallback(() => router.push("/habit/new"), [router]);

  const handleDragEnd = useCallback(({ data }: { data: Habit[] }) => {
    // Persist the new order; the live query re-renders in this order once written.
    void reorderHabits(data.map((h) => h.id));
  }, []);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Habit>) => (
      <ScaleDecorator>
        <HabitListRow
          habit={item}
          onEdit={() => router.push({ pathname: "/habit/edit/[id]", params: { id: item.id } })}
          onArchive={() => void archiveHabit(item.id)}
          onDrag={drag}
          isActive={isActive}
        />
      </ScaleDecorator>
    ),
    [router],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1">
        {habits.length === 0 ? (
          <EmptyState
            glyph="format-list-checks"
            title={strings.habits.emptyTitle}
            body={strings.habits.emptyBody}
            action={{ label: strings.habits.newAction, onPress: openNew }}
          />
        ) : (
          <DraggableFlatList
            data={habits}
            keyExtractor={(h) => h.id}
            renderItem={renderItem}
            onDragEnd={handleDragEnd}
            contentContainerStyle={{
              paddingHorizontal: space[4],
              paddingTop: space[4],
              paddingBottom: space[16],
              gap: space[2],
            }}
          />
        )}
        <FAB
          icon="plus"
          label={strings.habits.fabLabel}
          accessibilityLabel={strings.habits.fabLabel}
          onPress={openNew}
        />
      </View>
    </SafeAreaView>
  );
}
