import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { cadenceOf, updateHabit, useHabit } from "@/data/habits";
import { logger, strings } from "@/lib";
import { space, type HabitColorKey } from "@/theme";
import { HabitForm, type HabitFormValues } from "@/ui/habit";
import { EmptyState, type IconName } from "@/ui/primitives";

/**
 * Edit habit — modal (docs/architecture.md §6, build-plan §Phase 4).
 *
 * Thin route: loads the habit by id via `useHabit`, maps the flat row → form values
 * (`cadenceOf` bridges the cadence), and saves through `updateHabit`, then dismisses. Reuses
 * the SAME `HabitForm` as the add screen so field/validation logic lives in one place.
 */
export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, updatedAt } = useHabit(id);
  const habit = data[0];

  const handleSubmit = async (values: HabitFormValues) => {
    try {
      await updateHabit(id, values);
      router.back();
    } catch {
      logger.error("Update habit failed from edit-habit screen", { id });
    }
  };

  // Before the first live-query read resolves, `updatedAt` is undefined — show nothing (the
  // modal header is already visible) rather than a flash of "not found".
  if (!habit) {
    if (!updatedAt) return <View className="flex-1 bg-background" />;
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingHorizontal: space[4], paddingTop: space[6] }}
      >
        <EmptyState glyph="alert-circle-outline" title={strings.habitEdit.notFound} />
      </View>
    );
  }

  const initial: HabitFormValues = {
    name: habit.name,
    color: habit.color as HabitColorKey,
    icon: habit.icon as IconName,
    cadence: cadenceOf(habit),
    reminderEnabled: habit.reminderEnabled,
    reminderTime: habit.reminderTime,
  };

  return (
    <HabitForm
      initial={initial}
      submitLabel={strings.habitEdit.submit}
      onSubmit={handleSubmit}
    />
  );
}
