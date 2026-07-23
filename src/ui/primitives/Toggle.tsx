/**
 * Toggle — an on/off switch. docs/ui-registry.md, docs/ui-rules.md §7 (accent chrome).
 *
 * Wraps React Native's `Switch` and tints the "on" track with the user's global accent (the same
 * source as the FAB/primary buttons — `useAccent`), so a single preference re-tints it. Kept as a
 * primitive so both the habit-form reminder toggle and the Settings master switch share one
 * themed control. Fires the `select` haptic on change (RN's Switch has no built-in haptic).
 */
import { Switch } from "react-native";

import { haptics } from "@/lib";
import { useAccent, useTheme } from "@/theme";

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function Toggle({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
}: ToggleProps) {
  const { colors } = useTheme();
  const accent = useAccent();

  return (
    <Switch
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        haptics.select();
        onValueChange(next);
      }}
      // "on" = accent track + light thumb; "off" = neutral M3 surfaces.
      trackColor={{ false: colors.surfaceContainerHighest, true: accent.accent }}
      thumbColor={value ? accent.onAccent : colors.outline}
      // iOS uses trackColor.true as the fill; keep it consistent with the accent.
      ios_backgroundColor={colors.surfaceContainerHighest}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
