import { useRouter } from "expo-router";

import { createHabit } from "@/data/habits";
import { logger, strings } from "@/lib";
import { HabitForm, NEW_HABIT_DEFAULTS, type HabitFormValues } from "@/ui/habit";

/**
 * Add habit — modal (docs/architecture.md §6, build-plan §Phase 4).
 *
 * Thin route: renders the shared `HabitForm` with new-habit defaults and persists via
 * `createHabit`, then dismisses (native swipe-down/back also dismiss). Edit reuses the same
 * form at `habit/edit/[id]`.
 */
export default function NewHabitScreen() {
  const router = useRouter();

  const handleSubmit = async (values: HabitFormValues) => {
    try {
      await createHabit(values);
      router.back();
    } catch {
      // createHabit already logs at the data boundary; keep the modal open so the user can retry.
      logger.error("Create habit failed from new-habit screen");
    }
  };

  return (
    <HabitForm
      initial={NEW_HABIT_DEFAULTS}
      submitLabel={strings.habitNew.submit}
      onSubmit={handleSubmit}
    />
  );
}
