/**
 * EmptyState — docs/ui-registry.md, docs/ui-rules.md §7.
 *
 * The ONLY way to render an empty view. Never a bare "No data" anywhere else: a large glyph,
 * a `headline.large` title, optional body, and an optional primary action. (docs/architecture.md §8)
 */
import { View } from "react-native";

import { space } from "@/theme";

import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

export interface EmptyStateProps {
  glyph: IconName;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ glyph, title, body, action }: EmptyStateProps) {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ paddingHorizontal: space[6], gap: space[4] }}
    >
      <Icon name={glyph} size={64} color="onSurfaceVariant" />
      <Text variant="headline.large" color="onSurface" style={{ textAlign: "center" }}>
        {title}
      </Text>
      {body ? (
        <Text
          variant="body.large"
          color="onSurfaceVariant"
          style={{ textAlign: "center" }}
        >
          {body}
        </Text>
      ) : null}
      {action ? (
        <View style={{ marginTop: space[2] }}>
          <Button variant="filled" label={action.label} onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  );
}
