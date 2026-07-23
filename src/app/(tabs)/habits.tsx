import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { strings } from "@/lib";
import { EmptyState, FAB } from "@/ui/primitives";

/**
 * Habits — manage the full list (docs/project-overview.md §6, docs/architecture.md §8).
 *
 * Navigation shell (build-plan Phase 3): empty list → expressive empty state, with the FAB
 * as the always-present add affordance (docs/ui-rules.md §6). The `HabitListRow` list,
 * reorder, and archive land in Phase 4.
 */
export default function HabitsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1">
        <EmptyState
          glyph="format-list-checks"
          title={strings.habits.emptyTitle}
          body={strings.habits.emptyBody}
          action={{
            label: strings.habits.newAction,
            onPress: () => router.push("/habit/new"),
          }}
        />
        <FAB
          icon="plus"
          label={strings.habits.fabLabel}
          accessibilityLabel={strings.habits.fabLabel}
          onPress={() => router.push("/habit/new")}
        />
      </View>
    </SafeAreaView>
  );
}
