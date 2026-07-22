/**
 * Semantic haptics wrapper over expo-haptics — docs/ui-tokens.md §7.
 *
 * Components fire *intent* (`haptics.check()`), never the raw expo-haptics call, so the
 * physical feedback for a given interaction is defined once. Every interactive primitive
 * fires the correct haptic on press. (docs/ui-rules.md §1.3, §4)
 *
 * Verified against expo-haptics (SDK 57): `notificationAsync(NotificationFeedbackType)`,
 * `impactAsync(ImpactFeedbackStyle)`, `selectionAsync()`; all return `Promise<void>`.
 * Haptics are unavailable on web and on some Android devices — every call is fire-and-forget
 * and swallows rejection so a missing haptics engine never surfaces as an error.
 */
import * as Haptics from "expo-haptics";

function fire(run: () => Promise<void>): void {
  // Fire-and-forget: haptics are a non-essential enhancement. Never let a rejected promise
  // (web / unsupported device) float or crash the interaction. (docs/code-standards.md §9)
  void run().catch(() => {});
}

export const haptics = {
  /** Picking a chip/option. */
  select: () => fire(() => Haptics.selectionAsync()),
  /** Completing a habit (success notification). */
  check: () =>
    fire(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ),
  /** Undoing a check (light impact). */
  uncheck: () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Primary button press (light impact). */
  press: () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** All-done-today celebration (success notification). */
  celebrate: () =>
    fire(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ),
} as const;

/** The semantic haptic event names — matches the `haptic.*` tokens in docs/ui-tokens.md §7. */
export type HapticEvent = keyof typeof haptics;
