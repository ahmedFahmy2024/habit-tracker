/**
 * Kitchen-sink — THROWAWAY Phase 1 screen to eyeball every primitive in light + dark.
 *
 * Follows the OS color scheme (flip your device/simulator appearance to compare schemes).
 * Not linked from any tab; open via the `/kitchen-sink` route. Delete once features exist.
 * (docs/build-plan.md Phase 1)
 */
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HABIT_COLOR_KEYS, space, useHabitColors } from "@/theme";
import {
  Button,
  Chip,
  EmptyState,
  FAB,
  IconButton,
  Surface,
  Text,
  TextField,
  type ButtonVariant,
} from "@/ui/primitives";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space[3] }}>
      <Text variant="title.large">{title}</Text>
      {children}
    </View>
  );
}

function HabitSwatch({ colorKey }: { colorKey: (typeof HABIT_COLOR_KEYS)[number] }) {
  const c = useHabitColors(colorKey);
  return (
    <View
      style={{
        backgroundColor: c.container,
        borderRadius: 16,
        padding: space[3],
        minWidth: 96,
        gap: space[2],
      }}
    >
      <Text variant="label.large" style={{ color: c.onContainer }}>
        {colorKey}
      </Text>
      <View
        style={{ height: 20, borderRadius: 9999, backgroundColor: c.accent }}
      />
    </View>
  );
}

const BUTTON_VARIANTS: ButtonVariant[] = ["filled", "tonal", "outlined", "text"];

export default function KitchenSink() {
  const [text, setText] = useState("");
  const [errText, setErrText] = useState("");
  const [selectedChip, setSelectedChip] = useState("Mon");
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: space[4], gap: space[6], paddingBottom: space[16] }}
      >
        <Text variant="headline.large">Kitchen Sink</Text>

        <Section title="Typography">
          <Text variant="display.medium" emphasized>
            42
          </Text>
          <Text variant="headline.medium">Headline medium</Text>
          <Text variant="title.medium">Title medium (habit name)</Text>
          <Text variant="body.large">Body large — primary body copy.</Text>
          <Text variant="body.medium" color="onSurfaceVariant">
            Body medium, low emphasis.
          </Text>
          <Text variant="label.medium" color="onSurfaceVariant">
            🔥 5 day streak
          </Text>
        </Section>

        <Section title="Surfaces (tonal elevation)">
          <View style={{ flexDirection: "row", gap: space[3], flexWrap: "wrap" }}>
            {[0, 1, 2, 3].map((lvl) => (
              <Surface
                key={lvl}
                level={lvl as 0 | 1 | 2 | 3}
                padding={4}
                style={{ minWidth: 72 }}
              >
                <Text variant="label.large">level {lvl}</Text>
              </Surface>
            ))}
          </View>
        </Section>

        <Section title="Buttons">
          <View style={{ gap: space[3] }}>
            {BUTTON_VARIANTS.map((v) => (
              <Button key={v} variant={v} label={v} icon="check" onPress={() => {}} />
            ))}
            <Button variant="filled" label="Disabled" disabled onPress={() => {}} />
            <Button
              variant="filled"
              label="Tap to load"
              loading={loading}
              onPress={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1200);
              }}
            />
            <Button variant="tonal" label="Full width" fullWidth onPress={() => {}} />
          </View>
        </Section>

        <Section title="Icon buttons">
          <View style={{ flexDirection: "row", gap: space[3] }}>
            <IconButton icon="pencil" accessibilityLabel="Edit" onPress={() => {}} />
            <IconButton
              icon="star"
              variant="tonal"
              accessibilityLabel="Favorite"
              onPress={() => {}}
            />
            <IconButton
              icon="plus"
              variant="filled"
              accessibilityLabel="Add"
              onPress={() => {}}
            />
            <IconButton
              icon="delete"
              accessibilityLabel="Delete"
              disabled
              onPress={() => {}}
            />
          </View>
        </Section>

        <Section title="Chips (morph on select)">
          <View style={{ flexDirection: "row", gap: space[2], flexWrap: "wrap" }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <Chip
                key={d}
                label={d}
                selected={selectedChip === d}
                onPress={() => setSelectedChip(d)}
              />
            ))}
          </View>
          <Chip label="With icon" icon="fire" selected onPress={() => {}} />
        </Section>

        <Section title="Text fields">
          <TextField label="Habit name" value={text} onChangeText={setText} />
          <TextField
            label="With error"
            value={errText}
            onChangeText={setErrText}
            error="This field is required"
          />
        </Section>

        <Section title="Per-habit palettes">
          <View style={{ flexDirection: "row", gap: space[3], flexWrap: "wrap" }}>
            {HABIT_COLOR_KEYS.map((k) => (
              <HabitSwatch key={k} colorKey={k} />
            ))}
          </View>
        </Section>

        <Section title="Empty state">
          <Surface level={1} padding={4} style={{ height: 320 }}>
            <EmptyState
              glyph="clipboard-text-outline"
              title="No habits yet"
              body="Create your first habit to start building a streak."
              action={{ label: "Add habit", onPress: () => {} }}
            />
          </Surface>
        </Section>
      </ScrollView>

      <FAB icon="plus" accessibilityLabel="Add habit" onPress={() => {}} />
    </SafeAreaView>
  );
}
