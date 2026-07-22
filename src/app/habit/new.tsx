import { Text, View } from "react-native";

/**
 * Add / edit habit — modal (docs/project-overview.md §6).
 * Skeleton only; the CadencePicker / Color / Icon form arrives in build-plan Phase 4.
 */
export default function NewHabitScreen() {
  return (
    <View className="flex-1 bg-background px-4 pt-6">
      <Text className="text-2xl font-bold text-on-background">New habit</Text>
      <Text className="mt-1 text-base text-on-surface-variant">
        Name, color, icon, and cadence form goes here.
      </Text>
    </View>
  );
}
