import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { strings } from "@/lib";
import { EmptyState } from "@/ui/primitives";

/**
 * Today — the app's front door (docs/project-overview.md §6, docs/architecture.md §8).
 *
 * Navigation shell (build-plan Phase 3): no habits exist yet, so the whole screen is the
 * expressive empty state whose primary action opens the add-habit modal. The real
 * `useTodayHabits` list + CheckControls arrive in Phase 5.
 */
export default function TodayScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <EmptyState
        glyph="clipboard-check-outline"
        title={strings.today.emptyTitle}
        body={strings.today.emptyBody}
        action={{
          label: strings.today.emptyAction,
          onPress: () => router.push("/habit/new"),
        }}
      />
    </SafeAreaView>
  );
}
