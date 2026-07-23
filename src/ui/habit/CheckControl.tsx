/**
 * CheckControl — the signature "mark done" control. docs/ui-registry.md, docs/ui-rules.md §3/§4/§7.
 *
 * The Expressive centrepiece: toggling morphs an outlined rounded-square (idle, `radius.md`, in
 * the habit accent) into a filled accent circle (`radius.full`) with an animated stroke-drawn
 * check, all on one `progress` shared value (0 = unchecked, 1 = checked) so radius, fill,
 * border, the `scale.pop` overshoot and the check's `strokeDashoffset` move together on
 * `spring.bouncy`. Reduced motion swaps the spring for a `timings.fast` cross-fade (no pop; the
 * check offset is set directly) — motion is never required to read the state (docs/ui-rules §1.5).
 *
 * SVG stroke-draw chosen with the user over an SVG-free arc (docs/library-docs.md §11): the
 * check is a `react-native-svg` `Path` whose `strokeDashoffset` animates from its length → 0.
 *
 * Verified against installed react-native-reanimated 4.5 + react-native-svg 15.15.4:
 * `useSharedValue`/`useAnimatedStyle`/`useAnimatedProps`/`withSpring`/`withTiming`/`interpolate`/
 * `interpolateColor`/`Extrapolation` and `Svg`/`Path` with `strokeDasharray`/`strokeDashoffset`.
 */
import { useEffect } from "react";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { haptics } from "@/lib";
import {
  radius,
  scalePresets,
  springs,
  timings,
  useHabitColors,
  useMotion,
  type HabitColorKey,
} from "@/theme";
import { Pressable } from "@/ui/primitives";

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** The check mark path, drawn in a 24×24 viewBox; its length is a geometry constant (no measure). */
const CHECK_PATH = "M5 13 L10 18 L19 7";
// Segment lengths: √((10-5)²+(18-13)²) + √((19-10)²+(7-18)²) = √50 + √202 ≈ 7.07 + 14.21.
const CHECK_LEN = Math.sqrt(50) + Math.sqrt(202);

export interface CheckControlProps {
  checked: boolean;
  onToggle: () => void;
  colorKey: HabitColorKey;
  /** Habit name — used for the checkbox accessibility label. */
  label: string;
  /** Visual size of the control (dp). Hit target stays ≥48dp via Pressable hitSlop. */
  size?: number;
}

export function CheckControl({
  checked,
  onToggle,
  colorKey,
  label,
  size = 48,
}: CheckControlProps) {
  const { reduced } = useMotion();
  const { accent, onAccent } = useHabitColors(colorKey);
  // `onAccent` is the palette's AA-checked on-accent color (white on light accents, black on dark
  // pastels — ≥5.5:1 / ≥12:1, docs/ui-tokens.md §1.3) — the correct mark on the filled circle.

  // progress: 0 = unchecked (square outline), 1 = checked (filled circle + drawn check).
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    const target = checked ? 1 : 0;
    if (reduced) {
      progress.set(withTiming(target, timings.fast));
    } else {
      progress.set(withSpring(target, springs.bouncy));
    }
  }, [checked, reduced, progress]);

  // The morphing container: radius md↔full, transparent↔accent fill, accent outline↔none, and a
  // subtle scale.pop overshoot as it crosses toward checked.
  const containerStyle = useAnimatedStyle(() => {
    const p = progress.get();
    const pop = reduced
      ? 1
      : interpolate(p, [0, 0.6, 1], [1, scalePresets.pop, 1], Extrapolation.CLAMP);
    return {
      borderRadius: interpolate(
        p,
        [0, 1],
        [radius.md, size / 2],
        Extrapolation.CLAMP,
      ),
      backgroundColor: interpolateColor(p, [0, 1], ["transparent", accent]),
      borderWidth: interpolate(p, [0, 1], [2, 0], Extrapolation.CLAMP),
      borderColor: accent,
      transform: [{ scale: pop }],
    };
  });

  // Draw the check on as progress rises: offset from full length (hidden) → 0 (fully drawn).
  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(
      progress.get(),
      [0.35, 1],
      [CHECK_LEN, 0],
      Extrapolation.CLAMP,
    ),
  }));

  // Fade the check in slightly after the fill starts, so it never shows over a transparent box.
  const checkOpacity = useDerivedValue(() =>
    interpolate(progress.get(), [0.25, 0.5], [0, 1], Extrapolation.CLAMP),
  );
  const checkWrapStyle = useAnimatedStyle(() => ({ opacity: checkOpacity.get() }));

  return (
    <Pressable
      onPress={onToggle}
      haptic={null} // fired below so it matches the resulting state (check vs uncheck)
      scaleOnPress={false} // the morph is the press feedback
      onPressIn={() => {
        // Fire the semantic haptic on the transition the tap will cause.
        if (checked) haptics.uncheck();
        else haptics.check();
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            alignItems: "center",
            justifyContent: "center",
          },
          containerStyle,
        ]}
      >
        <Animated.View style={checkWrapStyle}>
          <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
            <AnimatedPath
              d={CHECK_PATH}
              stroke={onAccent}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={CHECK_LEN}
              animatedProps={checkProps}
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
