import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Settings — theme, accent, week-start, data export/import, about
 * (docs/project-overview.md §6). Skeleton only; built in build-plan Phase 7.
 */
export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-4 pt-6">
        <Text className="text-3xl font-bold text-on-background">Settings</Text>
        <Text className="mt-1 text-base text-on-surface-variant">
          Theme, week-start, and data options will live here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
