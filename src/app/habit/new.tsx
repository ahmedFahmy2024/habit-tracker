import { useRouter } from "expo-router";
import { View } from "react-native";

import { strings } from "@/lib";
import { space } from "@/theme";
import { Button, Text } from "@/ui/primitives";

/**
 * Add / edit habit — modal (docs/project-overview.md §6, docs/architecture.md §6).
 *
 * Navigation shell: a thin titled skeleton with a Close action so the modal can be dismissed
 * (native swipe-down also works). The CadencePicker / Color / Icon form + `createHabit`
 * arrive in build-plan Phase 4. Presented modally by the root `_layout` Stack.Screen.
 */
export default function NewHabitScreen() {
  const router = useRouter();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingHorizontal: space[4], paddingTop: space[6], gap: space[4] }}
    >
      <View style={{ gap: space[2] }}>
        <Text variant="headline.large" color="onBackground">
          {strings.habitNew.title}
        </Text>
        <Text variant="body.large" color="onSurfaceVariant">
          {strings.habitNew.body}
        </Text>
      </View>

      <Button
        variant="tonal"
        label={strings.common.done}
        onPress={() => router.back()}
      />
    </View>
  );
}
