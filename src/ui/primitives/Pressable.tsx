/**
 * Pressable — the base interactive wrapper. docs/ui-registry.md, docs/ui-rules.md §1.3/§4.
 *
 * Everything tappable is built on this. It guarantees the three non-negotiables for any
 * interactive element:
 *   • press-in scale animation (spring back on release), honoring reduced motion,
 *   • the correct haptic on press (default `press`),
 *   • a ≥48dp touch target via hitSlop even when the visual is smaller.
 *
 * Verified against react-native-reanimated 4.5.0: `useSharedValue`, `useAnimatedStyle`,
 * `withTiming`, `withSpring`, `Animated.createAnimatedComponent` all exist and are used as
 * below. The animated wrapper carries only the transform (raw token values) — visual
 * styling stays on children via className, avoiding className-on-animated-component interop.
 */
import { useCallback } from "react";
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { haptics, type HapticEvent } from "@/lib";
import { springs, timings, useMotion } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

// ≥48dp target: an 8dp hitSlop on every edge lifts a 32dp visual to 48dp. (docs/ui-rules.md §1.4)
const DEFAULT_HIT_SLOP = 8;

export interface PressableProps extends Omit<RNPressableProps, "style"> {
  onPress?: (e: GestureResponderEvent) => void;
  /** Semantic haptic to fire on press. `null` disables. Default `press`. */
  haptic?: HapticEvent | null;
  /** Apply the press-in scale animation. Default true. */
  scaleOnPress?: boolean;
  /** Extra hitSlop beyond the 48dp guarantee. */
  hitSlop?: number;
  className?: string;
  /** Static container style (e.g. borderRadius); merged under the animated transform. */
  style?: StyleProp<ViewStyle>;
}

export function Pressable({
  onPress,
  haptic = "press",
  scaleOnPress = true,
  disabled = false,
  hitSlop = DEFAULT_HIT_SLOP,
  className,
  style,
  children,
  ...rest
}: PressableProps) {
  const { reduced, pressScale } = useMotion();
  const scale = useSharedValue(1);

  // `.get()`/`.set()` (not `.value`) — the React-Compiler-safe shared-value API. The project
  // has `reactCompiler: true`, and `.value =` trips the react-hooks/immutability rule.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePressIn = useCallback(() => {
    if (scaleOnPress && !reduced) {
      scale.set(withTiming(pressScale, timings.pressIn));
    }
  }, [scaleOnPress, reduced, pressScale, scale]);

  const handlePressOut = useCallback(() => {
    if (scaleOnPress && !reduced) {
      scale.set(withSpring(1, springs.default));
    }
  }, [scaleOnPress, reduced, scale]);

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (disabled) return;
      if (haptic) haptics[haptic]();
      onPress?.(e);
    },
    [disabled, haptic, onPress],
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[style, animatedStyle]}
      className={className}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
