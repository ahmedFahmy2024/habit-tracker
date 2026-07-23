/**
 * SettingsRow — one row in a SettingsSection. docs/ui-registry.md.
 *
 * A leading label (+ optional description + optional icon) and a trailing control slot (`right`).
 * Two shapes:
 *   • an ACTION row (`onPress` set, no interactive `right`) → the whole row is a `Pressable`
 *     (≥48dp, press scale + haptic) — used for Export / Import / About.
 *   • a CONTROL row (`right` is an interactive control like `SegmentedControl`/`Chip`) → the row
 *     is a plain container and the control owns the interaction.
 * A full-width control (e.g. a segmented control) renders on its own line beneath the label via
 * the `stack` prop. Neutral roles only (no habit accent — ui-rules §7).
 */
import { type ReactNode } from "react";
import { View } from "react-native";

import { space } from "@/theme";
import { Icon, Pressable, Text, type IconName } from "@/ui/primitives";

export interface SettingsRowProps {
  label: string;
  description?: string;
  icon?: IconName;
  /** The trailing control / value / chevron. */
  right?: ReactNode;
  /** Render `right` full-width on its own line below the label (for segmented controls). */
  stack?: boolean;
  /** When set, the whole row is pressable (action rows). Omit for control rows. */
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function SettingsRow({
  label,
  description,
  icon,
  right,
  stack = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: SettingsRowProps) {
  const header = (
    <View className="flex-row items-center" style={{ gap: space[3] }}>
      {icon ? <Icon name={icon} size={22} color="onSurfaceVariant" /> : null}
      <View className="flex-1" style={{ gap: space[1] }}>
        <Text variant="title.medium" color="onSurface">
          {label}
        </Text>
        {description ? (
          <Text variant="body.medium" color="onSurfaceVariant">
            {description}
          </Text>
        ) : null}
      </View>
      {!stack && right ? <View>{right}</View> : null}
    </View>
  );

  const body = (
    <View style={{ gap: stack ? space[3] : 0 }}>
      {header}
      {stack && right ? <View>{right}</View> : null}
    </View>
  );

  const padding = {
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    minHeight: space[12],
    justifyContent: "center" as const,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={padding}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={padding}>{body}</View>;
}
