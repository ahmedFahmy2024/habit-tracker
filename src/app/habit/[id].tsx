import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

/**
 * Habit detail — history, streaks, heatmap (docs/project-overview.md §6).
 * Pushed route. Skeleton only; built in build-plan Phase 6.
 */
export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 bg-background px-4 pt-6">
      <Text className="text-2xl font-bold text-on-background">
        Habit detail
      </Text>
      <Text className="mt-1 text-base text-on-surface-variant">id: {id}</Text>
    </View>
  );
}
