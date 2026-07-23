import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { strings } from "@/lib";
import { space } from "@/theme";
import { Text } from "@/ui/primitives";

/**
 * Habit detail — history, streaks, heatmap (docs/project-overview.md §6, docs/architecture.md §6).
 *
 * Pushed route (native stack). Navigation shell: a thin titled skeleton; the StreakBadge,
 * Heatmap, and stats land in build-plan Phase 6. The stack header (with the native back
 * button) is provided by the root `_layout` Stack.Screen for this route.
 */
export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingHorizontal: space[4], paddingTop: space[6], gap: space[2] }}
    >
      <Text variant="headline.large" color="onBackground">
        {strings.habitDetail.title}
      </Text>
      <Text variant="body.large" color="onSurfaceVariant">
        {strings.habitDetail.body}
      </Text>
      <Text variant="label.large" color="onSurfaceVariant">
        id: {id}
      </Text>
    </View>
  );
}
