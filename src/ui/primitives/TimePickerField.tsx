/**
 * TimePickerField — pick a time of day. docs/ui-registry.md, build-plan Phase 9.
 *
 * A tonal pill showing the current time (e.g. "8:00 PM"); tapping it opens the native OS time
 * picker via `@react-native-community/datetimepicker`. The value it emits is **minutes past
 * midnight** (0..1439) — the storage form (docs/architecture.md §4) — so the DB/lib never handle
 * a `Date`; conversion lives in `src/lib/time.ts`.
 *
 * Platform behavior (verified from the installed 9.1.0 src/index.d.ts):
 *   • Android → the imperative `DateTimePickerAndroid.open({ mode:'time', ... })` shows the native
 *     dialog once and calls `onChange` with `event.type === 'set' | 'dismissed'`.
 *   • iOS → a controlled inline `<DateTimePicker mode="time">` (no imperative API); rendered only
 *     while open. `onChange` fires on each spin; we commit on change.
 *
 * ── Expo Go guard ───────────────────────────────────────────────────────────────────────────
 * The picker's native module is a `TurboModuleRegistry.getEnforcing` at *module scope*, so a plain
 * top-level `import` of `@react-native-community/datetimepicker` throws in Expo Go (the native
 * module isn't in the Expo Go binary). We therefore load it **lazily** on first open and skip it
 * under Expo Go — the pill still shows the (default) time but tapping is inert there. Full picker
 * runs in a dev/EAS build.
 */
import { isRunningInExpoGo } from "expo";
import { useState } from "react";
import { Platform, View } from "react-native";

import {
  dateToReminderTime,
  formatReminderTime,
  logger,
  reminderTimeToDate,
} from "@/lib";
import { radius, space, useAccent } from "@/theme";
import { Icon } from "./Icon";
import { Pressable } from "./Pressable";
import { Text } from "./Text";

// Lazily-required module (typed via `import type` so no value import runs at file load).
type PickerModule = typeof import("@react-native-community/datetimepicker");
type PickerChangeEvent = import("@react-native-community/datetimepicker").DateTimePickerEvent;
let cachedPicker: PickerModule | null | undefined;

function getPicker(): PickerModule | null {
  if (cachedPicker !== undefined) return cachedPicker;
  if (isRunningInExpoGo()) {
    cachedPicker = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedPicker = require("@react-native-community/datetimepicker") as PickerModule;
  } catch (error) {
    logger.error("TimePickerField: failed to load datetimepicker", { error });
    cachedPicker = null;
  }
  return cachedPicker;
}

/** Whether the native time picker can open on this build (false in Expo Go). */
const pickerAvailable = () => getPicker() !== null;

export interface TimePickerFieldProps {
  /** Minutes past midnight (0..1439). */
  value: number;
  onChange: (minutesPastMidnight: number) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function TimePickerField({
  value,
  onChange,
  disabled = false,
  accessibilityLabel,
}: TimePickerFieldProps) {
  const accent = useAccent();
  const [iosPicker, setIosPicker] = useState<PickerModule | null>(null);

  const inert = disabled || !pickerAvailable();

  const commit = (event: PickerChangeEvent, date?: Date) => {
    if (event.type === "set" && date) onChange(dateToReminderTime(date));
  };

  const open = () => {
    const picker = getPicker();
    if (disabled || !picker) return;
    if (Platform.OS === "android") {
      picker.DateTimePickerAndroid.open({
        value: reminderTimeToDate(value),
        mode: "time",
        is24Hour: false,
        onChange: commit,
      });
    } else {
      setIosPicker(picker); // render the inline spinner (below)
    }
  };

  const IosPicker = iosPicker?.default;

  return (
    <View className="flex-row items-center" style={{ gap: space[2] }}>
      <Pressable
        onPress={open}
        haptic="select"
        disabled={inert}
        scaleOnPress={!inert}
        className="flex-row items-center bg-surface-container"
        style={{
          borderRadius: radius.full,
          paddingVertical: space[2],
          paddingHorizontal: space[4],
          gap: space[2],
          opacity: inert ? 0.5 : 1,
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: inert }}
      >
        <Icon name="clock-outline" size={18} colorValue={accent.accent} />
        <Text variant="label.large" color="onSurface">
          {formatReminderTime(value)}
        </Text>
      </Pressable>

      {/* iOS: render the spinner inline only while open; Android uses the imperative dialog. */}
      {Platform.OS === "ios" && IosPicker ? (
        <IosPicker
          value={reminderTimeToDate(value)}
          mode="time"
          display="compact"
          accentColor={accent.accent}
          onChange={(event, date) => {
            setIosPicker(null);
            commit(event, date);
          }}
        />
      ) : null}
    </View>
  );
}
