import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { toggleCheckin } from "@/data/checkins";
import { useTodayHabits, type TodayHabit } from "@/data/today";
import { formatDayLong, strings, todayString } from "@/lib";
import { space, staggerTokens, useMotion } from "@/theme";
import { EmptyState } from "@/ui/primitives";
import { CompletionSummary, HabitCard } from "@/ui/habit";

/**
 * Today — the app's core loop (build-plan Phase 5, docs/architecture.md §7/§8).
 *
 * Thin route (architecture §3): computes `today` once at the boundary (`todayString()` — the
 * only `new Date()`; the domain never reads the clock), reads the derived list via
 * `useTodayHabits`, and composes `CompletionSummary` + a staggered list of `HabitCard`s.
 * Toggling routes through `toggleCheckin(habitId, today)` (today-only here, per §7.4); the
 * live query re-derives completion + streaks reactively.
 *
 * Three states (§8): no habits at all → "add your first habit"; habits exist but none are
 * scheduled today → "nothing due"; otherwise the summary + cards.
 */
export default function TodayScreen() {
  const router = useRouter();
  const { staggerItem, staggerMax } = useMotion();

  const today = todayString();
  const { items, done, total, noHabits } = useTodayHabits(today);

  const onToggle = useCallback(
    (habitId: string) => {
      // Fire-and-forget; the CheckControl already animated + fired the haptic. The live query
      // re-renders on the write, updating the ring + streaks. (docs/architecture.md §7.4)
      void toggleCheckin(habitId, today);
    },
    [today],
  );

  // No habits at all → the expressive onboarding empty state (its action opens the add modal).
  if (noHabits) {
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

  // Habits exist but none are scheduled for today.
  if (total === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <CompletionSummary done={0} total={0} date={formatDayLong(today)} />
        <EmptyState
          glyph="sofa-outline"
          title={strings.today.noneScheduledTitle}
          body={strings.today.noneScheduledBody}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Animated.FlatList
        data={items}
        keyExtractor={(it) => it.habit.id}
        ListHeaderComponent={
          <CompletionSummary done={done} total={total} date={formatDayLong(today)} />
        }
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: space[4] }}>
            <TodayRow
              item={item}
              delay={Math.min(index * staggerItem, staggerMax)}
              onToggle={() => onToggle(item.habit.id)}
              onOpen={() => router.push(`/habit/${item.habit.id}`)}
            />
          </View>
        )}
        contentContainerStyle={{
          paddingBottom: space[8],
          gap: space[2],
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/** One entrance-staggered card. `delay === 0` (reduced motion) ⇒ effectively no stagger. */
function TodayRow({
  item,
  delay,
  onToggle,
  onOpen,
}: {
  item: TodayHabit;
  delay: number;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(staggerTokens.max)}>
      <HabitCard
        habit={item.habit}
        checked={item.checked}
        streak={item.streak}
        streakUnit={item.streakUnit}
        onToggle={onToggle}
        onOpen={onOpen}
      />
    </Animated.View>
  );
}
