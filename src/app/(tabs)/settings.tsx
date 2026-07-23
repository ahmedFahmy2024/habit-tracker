import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { strings } from "@/lib";
import { space } from "@/theme";
import { Button, Text } from "@/ui/primitives";

/**
 * Settings — theme, accent, week-start, data export/import, about
 * (docs/project-overview.md §6). Navigation shell: a minimal titled shell; the real
 * preference rows + export/import land in build-plan Phase 7.
 */
export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        className="flex-1"
        style={{ paddingHorizontal: space[4], paddingTop: space[6], gap: space[4] }}
      >
        <View style={{ gap: space[2] }}>
          <Text variant="headline.large" color="onBackground">
            {strings.settings.title}
          </Text>
          <Text variant="body.large" color="onSurfaceVariant">
            {strings.settings.body}
          </Text>
        </View>

        {/* THROWAWAY (Phase 3): the only entry point to the habit-detail push until the
            Habits list rows exist (Phase 4/6). Delete this button then. */}
        <Button
          variant="outlined"
          label="Open sample habit detail"
          onPress={() => router.push("/habit/sample")}
        />
      </View>
    </SafeAreaView>
  );
}
