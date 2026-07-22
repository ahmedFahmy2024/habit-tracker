import { useColorScheme } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Today — the app's front door (docs/project-overview.md §6).
 * Skeleton only: proves NativeWind className theming + dark-mode flip work end-to-end.
 * Real habit list arrives in build-plan Phase 5.
 */
export default function TodayScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-4 pt-6">
        <Text className="text-3xl font-bold text-on-background">Today</Text>
        <Text className="mt-1 text-base text-on-surface-variant">
          Your habits for today will live here.
        </Text>

        <View className="mt-6 rounded-lg bg-surface-container p-4">
          <Text className="text-base font-medium text-on-surface">
            Theme check
          </Text>
          <Text className="mt-1 text-sm text-on-surface-variant">
            Current scheme: {colorScheme ?? "system"}
          </Text>
          <Pressable
            onPress={toggleColorScheme}
            className="mt-3 self-start rounded-full bg-primary px-4 py-2 active:opacity-80"
          >
            <Text className="text-sm font-medium text-on-primary">
              Toggle light / dark
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
