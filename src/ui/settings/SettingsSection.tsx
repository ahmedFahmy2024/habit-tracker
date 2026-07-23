/**
 * SettingsSection — a titled group of settings rows. docs/ui-registry.md.
 *
 * Neutral chrome (no habit accent — ui-rules §7): an optional section title, a `Surface` (level 1,
 * rounded) wrapping the rows with hairline `outlineVariant` dividers between them, and an optional
 * footer note. Children are `SettingsRow`s (or any node).
 */
import { Children, type ReactNode } from "react";
import { View } from "react-native";

import { space } from "@/theme";
import { Surface, Text } from "@/ui/primitives";

export interface SettingsSectionProps {
  title?: string;
  footer?: string;
  children: ReactNode;
}

export function SettingsSection({ title, footer, children }: SettingsSectionProps) {
  const rows = Children.toArray(children);
  return (
    <View style={{ gap: space[2] }}>
      {title ? (
        <Text
          variant="label.large"
          color="onSurfaceVariant"
          style={{ paddingHorizontal: space[1] }}
        >
          {title}
        </Text>
      ) : null}
      <Surface level={1} radius="lg">
        {rows.map((row, i) => (
          <View key={i}>
            {i > 0 ? (
              <View
                className="bg-outline-variant"
                style={{ height: 1, marginHorizontal: space[4] }}
              />
            ) : null}
            {row}
          </View>
        ))}
      </Surface>
      {footer ? (
        <Text
          variant="body.medium"
          color="onSurfaceVariant"
          style={{ paddingHorizontal: space[1] }}
        >
          {footer}
        </Text>
      ) : null}
    </View>
  );
}
