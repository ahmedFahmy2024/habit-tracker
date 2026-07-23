/**
 * ReminderSettings — the Settings "Reminders" section (build-plan Phase 9).
 *
 * Global reminder controls (per-habit reminders live on the habit form): a master enable switch, a
 * default reminder time, the OS permission state with a request / open-OS-settings action, and a
 * test-reminder trigger for verification. Surfaces a clear denied / OS-off state so there is NEVER
 * a silent failure (Phase 9 done-when).
 *
 * Kept out of the route so `settings.tsx` stays thin (docs/architecture.md §3). All persistence is
 * the `usePreferences` store; scheduling reconciliation goes through `reconcileReminders`.
 */
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { reconcileReminders } from "@/data/habits";
import {
  ensurePermission,
  getPermissionState,
  remindersAvailable,
  scheduleTestReminder,
  strings,
  type PermissionState,
} from "@/lib";
import { usePreferences } from "@/store";
import { space } from "@/theme";
import { Button, Text, TimePickerField, Toggle } from "@/ui/primitives";

import { SettingsRow } from "./SettingsRow";
import { SettingsSection } from "./SettingsSection";

const s = strings.reminders;

export function ReminderSettings() {
  const masterEnabled = usePreferences((st) => st.reminderMasterEnabled);
  const setMasterEnabled = usePreferences((st) => st.setReminderMasterEnabled);
  const defaultTime = usePreferences((st) => st.reminderDefaultTime);
  const setDefaultTime = usePreferences((st) => st.setReminderDefaultTime);

  const available = remindersAvailable();
  const [permission, setPermission] = useState<PermissionState>("undetermined");

  const refreshPermission = useCallback(() => {
    void getPermissionState().then(setPermission);
  }, []);

  // Re-check whenever the screen regains focus (the user may have changed it in OS settings and
  // come back), plus once on mount.
  useEffect(refreshPermission, [refreshPermission]);
  useFocusEffect(refreshPermission);

  const onToggleMaster = (next: boolean) => {
    setMasterEnabled(next);
    // Apply immediately: enabling reschedules every habit's reminder; disabling cancels them all.
    void reconcileReminders();
    if (next) refreshPermission();
  };

  const onDefaultTimeChange = (minutes: number) => {
    setDefaultTime(minutes);
    // Default time is a template for NEW reminders; it doesn't retro-shift existing ones, so no
    // reschedule here (existing habits keep their own stored time).
  };

  const onRequestPermission = async () => {
    const granted = await ensurePermission();
    refreshPermission();
    if (granted) void reconcileReminders();
  };

  const onOpenSettings = () => {
    void Linking.openSettings();
  };

  const onTest = async () => {
    const ok = await scheduleTestReminder(10);
    if (ok) {
      Alert.alert(s.testScheduledTitle, s.testScheduledBody);
    } else {
      Alert.alert(s.testFailedTitle, s.testFailedBody);
    }
  };

  const permissionValue = !available
    ? s.permissionUnavailable
    : permission === "granted"
      ? s.permissionGranted
      : permission === "denied"
        ? s.permissionDenied
        : s.permissionUndetermined;

  return (
    <SettingsSection title={s.settingsSection} footer={s.settingsDescription}>
      {/* Expo Go: reminders are stubbed out (SDK 53+). Say so plainly (no silent failure). */}
      {!available ? (
        <SettingsRow
          label={s.permissionUnavailable}
          description={s.unavailableBody}
          icon="information-outline"
        />
      ) : null}

      <SettingsRow
        label={s.masterEnableLabel}
        description={s.masterEnableDescription}
        right={
          <Toggle
            value={masterEnabled}
            onValueChange={onToggleMaster}
            disabled={!available}
            accessibilityLabel={s.a11yMasterEnable}
          />
        }
      />

      <SettingsRow
        label={s.defaultTimeLabel}
        description={s.defaultTimeDescription}
        right={
          <TimePickerField
            value={defaultTime}
            onChange={onDefaultTimeChange}
            disabled={!available || !masterEnabled}
            accessibilityLabel={s.a11yDefaultTime}
          />
        }
      />

      <SettingsRow
        label={s.permissionLabel}
        stack
        right={
          <View style={{ gap: space[3] }}>
            <Text
              variant="body.large"
              color={permission === "denied" ? "error" : "onSurfaceVariant"}
            >
              {permissionValue}
            </Text>
            {available && permission === "denied" ? (
              <>
                <Text variant="body.medium" color="onSurfaceVariant">
                  {s.osOffBody}
                </Text>
                <Button
                  variant="tonal"
                  label={s.permissionOpenSettingsAction}
                  onPress={onOpenSettings}
                />
              </>
            ) : available && permission === "undetermined" ? (
              <Button
                variant="tonal"
                label={s.permissionRequestAction}
                onPress={onRequestPermission}
              />
            ) : null}
          </View>
        }
      />

      {available ? (
        <SettingsRow
          label={s.testAction}
          icon="bell-ring-outline"
          onPress={onTest}
          accessibilityLabel={s.testAction}
        />
      ) : null}
    </SettingsSection>
  );
}
