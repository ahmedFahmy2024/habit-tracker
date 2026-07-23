import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, ScrollView, View } from "react-native";

import { archiveHabit, deleteHabit } from "@/data/habits";
import { useHabitStats } from "@/data/habitStats";
import { toggleCheckin } from "@/data/checkins";
import { todayString, formatDayLong, logger, strings } from "@/lib";
import { space, type HabitColorKey } from "@/theme";
import type { DayString } from "@/domain";
import { Heatmap, StreakBadge } from "@/ui/habit";
import { Button, EmptyState, Surface, Text } from "@/ui/primitives";

/**
 * Habit detail — history & trustworthy stats (docs/architecture.md §6, build-plan §Phase 6).
 *
 * Thin pushed route: `todayString()` at the boundary → `useHabitStats(id, today)` derives the
 * streak/best/completion/heatmap from the pure domain (memoized, §9); this screen only composes
 * `StreakBadge` + a stat row + `Heatmap` + the manage actions. Backfill and the manage writers
 * live in `src/data`. The stack header title is set to the habit name once it loads.
 */
export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const today = todayString();
  const stats = useHabitStats(id, today);
  const { habit } = stats;

  // Backfill a past/today check-in from the heatmap (future days are blocked in Heatmap itself,
  // and toggleCheckin's caller-guard is satisfied here — §7.4). The live query re-derives stats.
  const handleToggleDay = useCallback(
    (day: DayString) => {
      if (day > today) return; // defensive: never write a future day
      toggleCheckin(id, day).catch((error) =>
        logger.error("Backfill toggle failed from detail heatmap", { id, day, error }),
      );
    },
    [id, today],
  );

  const confirmArchive = useCallback(() => {
    Alert.alert(
      strings.habitDetail.archiveConfirmTitle,
      strings.habitDetail.archiveConfirmBody,
      [
        { text: strings.common.cancel, style: "cancel" },
        {
          text: strings.habitDetail.archive,
          style: "destructive",
          onPress: async () => {
            try {
              await archiveHabit(id);
              router.back();
            } catch (error) {
              logger.error("Archive failed from detail screen", { id, error });
            }
          },
        },
      ],
    );
  }, [id, router]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      strings.habitDetail.deleteConfirmTitle,
      strings.habitDetail.deleteConfirmBody,
      [
        { text: strings.common.cancel, style: "cancel" },
        {
          text: strings.habitDetail.delete,
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit(id);
              router.back();
            } catch (error) {
              logger.error("Delete failed from detail screen", { id, error });
            }
          },
        },
      ],
    );
  }, [id, router]);

  // Loading gap: before the habit live query resolves, show nothing under the (already visible)
  // stack header rather than flashing "not found". Once ready with no row → genuine not-found.
  if (!habit) {
    if (!stats.ready) return <View className="flex-1 bg-background" />;
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingHorizontal: space[4], paddingTop: space[6] }}
      >
        <Stack.Screen options={{ title: "" }} />
        <EmptyState glyph="alert-circle-outline" title={strings.habitDetail.notFound} />
      </View>
    );
  }

  const colorKey = habit.color as HabitColorKey;
  const bestValue = strings.habitDetail.bestValue(stats.best, stats.streakUnit);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingHorizontal: space[4],
        paddingTop: space[6],
        paddingBottom: space[10],
        gap: space[6],
      }}
    >
      <Stack.Screen options={{ title: habit.name }} />

      {/* Streak hero */}
      <StreakBadge
        current={stats.streak}
        best={stats.best}
        unit={stats.streakUnit}
        colorKey={colorKey}
      />

      {/* Stat row — Best · Completion · Check-ins */}
      <View className="flex-row" style={{ gap: space[3] }}>
        <StatTile label={strings.habitDetail.statBest} value={bestValue} />
        <StatTile
          label={strings.habitDetail.statCompletion}
          value={strings.habitDetail.completionValue(stats.completion)}
        />
        <StatTile
          label={strings.habitDetail.statTotal}
          value={String(stats.totalCheckins)}
        />
      </View>

      {/* History heatmap */}
      <View style={{ gap: space[3] }}>
        <View style={{ gap: space[1] }}>
          <Text variant="title.medium">{strings.habitDetail.heatmapTitle}</Text>
          <Text variant="body.medium" color="onSurfaceVariant">
            {strings.habitDetail.heatmapHint}
          </Text>
        </View>
        <Heatmap
          buckets={stats.buckets}
          colorKey={colorKey}
          today={today}
          onToggleDay={handleToggleDay}
        />
        <Text variant="label.small" color="onSurfaceVariant">
          {formatDayLong(stats.from)} – {formatDayLong(stats.to)}
        </Text>
      </View>

      {/* Manage actions */}
      <View style={{ gap: space[2] }}>
        <Button
          variant="tonal"
          icon="pencil-outline"
          label={strings.habitDetail.edit}
          accessibilityLabel={strings.habitDetail.a11yEdit}
          fullWidth
          onPress={() => router.push(`/habit/edit/${id}`)}
        />
        <Button
          variant="outlined"
          icon="archive-outline"
          label={strings.habitDetail.archive}
          accessibilityLabel={strings.habitDetail.a11yArchive}
          fullWidth
          onPress={confirmArchive}
        />
        <Button
          variant="text"
          icon="trash-can-outline"
          label={strings.habitDetail.delete}
          accessibilityLabel={strings.habitDetail.a11yDelete}
          fullWidth
          onPress={confirmDelete}
        />
      </View>
    </ScrollView>
  );
}

/** A single stat tile: big value over a quiet label. Thin composition of Surface + Text. */
function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Surface
      level={1}
      radius="lg"
      padding={4}
      className="flex-1 items-center"
      style={{ gap: space[1] }}
    >
      <Text variant="title.large">{value}</Text>
      <Text variant="label.medium" color="onSurfaceVariant">
        {label}
      </Text>
    </Surface>
  );
}
