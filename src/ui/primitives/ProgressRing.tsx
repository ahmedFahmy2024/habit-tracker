/**
 * ProgressRing — circular completion indicator (Today header). docs/ui-registry.md, ui-rules §4.
 *
 * A `react-native-svg` track circle + a progress circle whose `strokeDashoffset` animates from
 * "empty" (offset = circumference) to `value` on `springs.default`. At 100% it pops once on the
 * rising edge (`spring.bouncy` scale + `haptic.celebrate`); reduced motion snaps to `value` with
 * no pop (docs/ui-rules §1.5). Colors are theme roles (track `surfaceContainerHighest`, progress
 * `primary`) resolved to raw values — SVG stroke takes a color string, not a className.
 *
 * SVG chosen with the user over an SVG-free arc (docs/library-docs §11). Verified against
 * react-native-svg 15.15.4 (`Svg`/`Circle` + `strokeDasharray`/`strokeDashoffset`) and
 * reanimated 4.5 (`useAnimatedProps`/`useAnimatedStyle`/`withSpring`).
 */
import { useEffect, useRef, type ReactNode } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { haptics } from "@/lib";
import { scalePresets, springs, timings, useMotion, useTheme } from "@/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  /** Completion fraction, 0..1 (clamped). */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Pop + celebrate haptic when it first reaches 100%. Default true. */
  celebrateOn100?: boolean;
  /** Center content (e.g. the done/total count). */
  label?: ReactNode;
  accessibilityLabel?: string;
}

export function ProgressRing({
  value,
  size = 72,
  strokeWidth = 8,
  celebrateOn100 = true,
  label,
  accessibilityLabel,
}: ProgressRingProps) {
  const { reduced } = useMotion();
  const { colors } = useTheme();

  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  // progress shared value in [0,1]; drives strokeDashoffset.
  const progress = useSharedValue(clamped);
  // pop scale for the 100% celebration.
  const pop = useSharedValue(1);
  const wasComplete = useRef(clamped >= 1);

  useEffect(() => {
    if (reduced) {
      progress.set(withTiming(clamped, timings.fast));
    } else {
      progress.set(withSpring(clamped, springs.default));
    }

    const nowComplete = clamped >= 1;
    if (nowComplete && !wasComplete.current) {
      // Rising edge to 100%: celebrate once.
      if (celebrateOn100) haptics.celebrate();
      if (!reduced) {
        pop.set(
          withSequence(
            withSpring(scalePresets.pop, springs.bouncy),
            withSpring(1, springs.bouncy),
          ),
        );
      }
    }
    wasComplete.current = nowComplete;
  }, [clamped, reduced, celebrateOn100, progress, pop]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.get()),
  }));

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));

  return (
    <Animated.View
      style={[{ width: size, height: size }, popStyle]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ now: Math.round(clamped * 100), min: 0, max: 100 }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.surfaceContainerHighest}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={ringProps}
          // Start the arc at 12 o'clock and sweep clockwise.
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {label != null && (
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {label}
        </View>
      )}
    </Animated.View>
  );
}
