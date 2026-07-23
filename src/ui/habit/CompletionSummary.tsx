/**
 * CompletionSummary — the Today header. docs/ui-registry.md, docs/ui-rules.md §5/§motion.
 *
 * Composes the `ProgressRing` (today's completion) with a `title.large` date and a
 * done/total count. When everything is done (`done === total && total > 0`) it shows the
 * celebratory "All done!" line (`headline.large`) beside a full ring — the ring's own 100%
 * pop + `haptic.celebrate` fire from `ProgressRing` on the rising edge (ui-rules §motion).
 *
 * Presentation-only: the screen passes already-derived `done`/`total`/`date`.
 */
import { View } from "react-native";

import { strings } from "@/lib";
import { space, useAccent } from "@/theme";
import { ProgressRing, Text } from "@/ui/primitives";

export interface CompletionSummaryProps {
  done: number;
  total: number;
  /** Pre-formatted header date, e.g. "Thursday, Jul 23". */
  date: string;
}

export function CompletionSummary({ done, total, date }: CompletionSummaryProps) {
  const value = total > 0 ? done / total : 0;
  const allDone = total > 0 && done === total;
  // The "All done!" hero carries the global accent, matching the ring it sits beside (Phase 8).
  const accent = useAccent();

  return (
    <View
      className="flex-row items-center"
      style={{
        gap: space[4],
        paddingHorizontal: space[4],
        paddingTop: space[2],
        paddingBottom: space[6],
      }}
    >
      <ProgressRing
        value={value}
        size={72}
        accessibilityLabel={strings.today.a11yProgress(done, total)}
        label={
          <Text variant="label.medium" color="onSurface" emphasized>
            {done}/{total}
          </Text>
        }
      />

      <View className="flex-1" style={{ gap: space[1] }}>
        <Text variant="title.large" color="onSurface" numberOfLines={1}>
          {date}
        </Text>
        {allDone ? (
          <Text variant="headline.large" colorValue={accent.accent}>
            {strings.today.allDoneTitle}
          </Text>
        ) : (
          <Text variant="body.medium" color="onSurfaceVariant">
            {strings.today.progressCount(done, total)}
          </Text>
        )}
      </View>
    </View>
  );
}
