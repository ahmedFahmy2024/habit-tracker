/**
 * Cadence presentation helpers — turn a domain `Cadence` into display copy for the manage
 * list (docs/ui-registry.md `HabitListRow`). Pure formatting only; the scheduling/streak math
 * lives in `src/domain`. All copy comes from `strings.cadence` (docs/code-standards.md §10).
 */
import type { Cadence, Weekday } from "@/domain";

import { strings } from "./strings";

/** Sunday-first display order of weekday numbers (0=Sun..6=Sat, docs/architecture.md §7.2). */
export const WEEKDAY_DISPLAY_ORDER: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** Are the given weekdays exactly Mon–Fri (a common shortcut worth naming)? */
function isMonToFri(days: readonly Weekday[]): boolean {
  if (days.length !== 5) return false;
  const set = new Set(days);
  return [1, 2, 3, 4, 5].every((d) => set.has(d as Weekday));
}

/** Are the given weekdays exactly Sat+Sun? */
function isWeekend(days: readonly Weekday[]): boolean {
  if (days.length !== 2) return false;
  const set = new Set(days);
  return set.has(0) && set.has(6);
}

/**
 * A compact one-line summary of a habit's cadence, e.g. "Every day", "Mon, Wed, Fri",
 * "Weekdays", "3× a week". Used by the manage-list row's metadata line.
 */
export function cadenceSummary(cadence: Cadence): string {
  const c = strings.cadence;
  switch (cadence.type) {
    case "daily":
      return c.summaryDaily;
    case "weekly_count":
      return cadence.weeklyTarget <= 1
        ? c.summaryWeeklyOne
        : c.summaryWeeklyN(cadence.weeklyTarget);
    case "weekdays": {
      const days = [...cadence.weekdays].sort((a, b) => a - b);
      if (days.length === 0) return c.weekdays;
      if (days.length === 7) return c.summaryEveryday;
      if (isMonToFri(days)) return c.weekdays;
      if (isWeekend(days)) return c.summaryWeekends;
      return days.map((d) => c.weekdayLong[d].slice(0, 3)).join(", ");
    }
  }
}
