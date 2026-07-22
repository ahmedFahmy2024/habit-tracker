import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Habits — manage the full list (docs/project-overview.md §6). Skeleton only.
 * Add/edit/reorder/archive arrive in build-plan Phase 4.
 */
export default function HabitsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-4 pt-6">
        <Text className="text-3xl font-bold text-on-background">Habits</Text>
        <Text className="mt-1 text-base text-on-surface-variant">
          Create and manage your habits here.
        </Text>

        <Link href="/habit/new" asChild>
          <Pressable className="mt-6 self-start rounded-full bg-primary px-4 py-2 active:opacity-80">
            <Text className="text-sm font-medium text-on-primary">
              + New habit
            </Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
