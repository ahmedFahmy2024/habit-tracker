/**
 * HabitForm — the shared add/edit habit form. docs/build-plan.md §Phase 4.
 *
 * Composes the pickers (`ColorPicker` / `IconPicker` / `CadencePicker`) + a name `TextField`,
 * validates (name required; weekdays need ≥1 day; weekly target ≥1), surfaces inline errors,
 * and emits a normalized payload via `onSubmit`. It is presentation-only: the routes that use
 * it (`habit/new`, `habit/edit/[id]`) own the `createHabit`/`updateHabit` call and dismissal.
 *
 * Kept out of `src/app/**` so route files stay thin (docs/architecture.md §3). Both the add and
 * edit screens render this same component.
 */
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Cadence } from "@/domain";
import { getPermissionState, strings, type PermissionState } from "@/lib";
import { usePreferences } from "@/store";
import { space, type HabitColorKey } from "@/theme";
import {
  Button,
  Text,
  TextField,
  TimePickerField,
  Toggle,
  type IconName,
} from "@/ui/primitives";

import { CadencePicker } from "./CadencePicker";
import { ColorPicker } from "./ColorPicker";
import { IconPicker } from "./IconPicker";

export interface HabitFormValues {
  name: string;
  color: HabitColorKey;
  icon: IconName;
  cadence: Cadence;
  /** Local reminder (Phase 9). */
  reminderEnabled: boolean;
  /** Minutes past midnight (0..1439), or null when the reminder is off. */
  reminderTime: number | null;
}

export interface HabitFormProps {
  /** Initial field values (an existing habit for edit, or sensible defaults for add). */
  initial: HabitFormValues;
  /** Label for the submit button (e.g. "Create habit" / "Save changes"). */
  submitLabel: string;
  /** Called with the validated values. May be async; the button shows a spinner meanwhile. */
  onSubmit: (values: HabitFormValues) => void | Promise<void>;
}

/** Sensible defaults for a brand-new habit. */
export const NEW_HABIT_DEFAULTS: HabitFormValues = {
  name: "",
  color: "green",
  icon: "water",
  cadence: { type: "daily" },
  reminderEnabled: false,
  reminderTime: null,
};

export function HabitForm({ initial, submitLabel, onSubmit }: HabitFormProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initial.name);
  const [color, setColor] = useState<HabitColorKey>(initial.color);
  const [icon, setIcon] = useState<IconName>(initial.icon);
  const [cadence, setCadence] = useState<Cadence>(initial.cadence);
  const [reminderEnabled, setReminderEnabled] = useState(initial.reminderEnabled);
  // Keep a working time even while the reminder is off, so toggling on restores the last choice.
  const defaultTime = usePreferences((s) => s.reminderDefaultTime);
  const [reminderTime, setReminderTime] = useState<number>(
    initial.reminderTime ?? defaultTime,
  );
  const [permission, setPermission] = useState<PermissionState>("granted");
  const [nameError, setNameError] = useState<string>();
  const [cadenceError, setCadenceError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  // Reflect the current OS permission so a denied state is visible (no silent failure — Phase 9).
  // Re-check when the reminder is switched on (the user may have changed it in OS settings).
  useEffect(() => {
    if (!reminderEnabled) return;
    let active = true;
    void getPermissionState().then((state) => {
      if (active) setPermission(state);
    });
    return () => {
      active = false;
    };
  }, [reminderEnabled]);

  /** Validate; returns the trimmed values on success, or null (and sets errors) on failure. */
  const validate = (): HabitFormValues | null => {
    const trimmed = name.trim();
    let ok = true;

    if (trimmed.length === 0) {
      setNameError(strings.habitForm.errorNameRequired);
      ok = false;
    } else {
      setNameError(undefined);
    }

    if (cadence.type === "weekdays" && cadence.weekdays.length === 0) {
      setCadenceError(strings.habitForm.errorWeekdaysRequired);
      ok = false;
    } else if (cadence.type === "weekly_count" && cadence.weeklyTarget < 1) {
      setCadenceError(strings.habitForm.errorWeeklyTarget);
      ok = false;
    } else {
      setCadenceError(undefined);
    }

    return ok
      ? {
          name: trimmed,
          color,
          icon,
          cadence,
          reminderEnabled,
          // Only persist a time when the reminder is on; off ⇒ null (schema invariant).
          reminderTime: reminderEnabled ? reminderTime : null,
        }
      : null;
  };

  const handleSubmit = async () => {
    const values = validate();
    if (!values) return;
    try {
      setSubmitting(true);
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingHorizontal: space[4],
        paddingTop: space[4],
        paddingBottom: insets.bottom + space[6],
        gap: space[6],
      }}
    >
      {/* TextField renders its own floating label, so no outer Field label here. */}
      <TextField
        label={strings.habitForm.nameLabel}
        placeholder={strings.habitForm.namePlaceholder}
        value={name}
        onChangeText={(t) => {
          setName(t);
          if (nameError) setNameError(undefined);
        }}
        error={nameError}
        maxLength={60}
        autoFocus={initial.name.length === 0}
      />

      <Field label={strings.habitForm.colorLabel}>
        <ColorPicker value={color} onChange={setColor} />
      </Field>

      <Field label={strings.habitForm.iconLabel}>
        <IconPicker value={icon} onChange={setIcon} colorKey={color} />
      </Field>

      <Field label={strings.habitForm.cadenceLabel} error={cadenceError}>
        <CadencePicker
          value={cadence}
          onChange={(c) => {
            setCadence(c);
            if (cadenceError) setCadenceError(undefined);
          }}
        />
      </Field>

      <Field label={strings.reminders.formSectionLabel}>
        <View className="flex-row items-center" style={{ gap: space[3] }}>
          <View className="flex-1" style={{ gap: space[1] }}>
            <Text variant="body.large" color="onSurface">
              {strings.reminders.formToggleLabel}
            </Text>
            <Text variant="body.medium" color="onSurfaceVariant">
              {strings.reminders.formToggleDescription}
            </Text>
          </View>
          <Toggle
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            accessibilityLabel={strings.reminders.a11yToggle}
          />
        </View>

        {reminderEnabled ? (
          <View
            className="flex-row items-center justify-between"
            style={{ marginTop: space[4] }}
          >
            <Text variant="body.large" color="onSurface">
              {strings.reminders.formTimeLabel}
            </Text>
            <TimePickerField
              value={reminderTime}
              onChange={setReminderTime}
              accessibilityLabel={strings.reminders.a11yTime}
            />
          </View>
        ) : null}

        {reminderEnabled && permission === "denied" ? (
          <Text
            variant="body.medium"
            color="error"
            style={{ marginTop: space[3] }}
          >
            {strings.reminders.formPermissionDenied}
          </Text>
        ) : reminderEnabled && permission === "unavailable" ? (
          <Text
            variant="body.medium"
            color="onSurfaceVariant"
            style={{ marginTop: space[3] }}
          >
            {strings.reminders.unavailableBody}
          </Text>
        ) : null}
      </Field>

      <Button
        variant="filled"
        label={submitLabel}
        onPress={handleSubmit}
        loading={submitting}
        fullWidth
      />
    </ScrollView>
  );
}

/** A labelled form section: a `title.medium` label above the control + optional error below. */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: space[3] }}>
      <Text variant="title.medium" color="onBackground">
        {label}
      </Text>
      {children}
      {error ? (
        <Text variant="body.medium" color="error">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
