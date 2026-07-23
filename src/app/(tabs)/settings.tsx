/**
 * Settings — theme, accent, week-start, data export/import, about (build-plan Phase 7,
 * docs/architecture.md §2/§3). Thin route: reads the `usePreferences` store + calls the
 * `backup` data layer; all presentation is composed from primitives + `src/ui/settings`.
 * Preferences persist in `key_value` (sqlite) and re-theme instantly via `ThemeSync`.
 */
import Constants from "expo-constants";
import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { exportData, importData } from "@/data/backup";
import { logger, strings } from "@/lib";
import { usePreferences, type ThemeMode, type WeekStart } from "@/store";
import { space } from "@/theme";
import { SegmentedControl, Text } from "@/ui/primitives";
import { ColorPicker } from "@/ui/habit";
import { ReminderSettings, SettingsRow, SettingsSection } from "@/ui/settings";

const s = strings.settings;

const THEME_SEGMENTS: { key: ThemeMode; label: string }[] = [
  { key: "light", label: s.themeLight },
  { key: "dark", label: s.themeDark },
  { key: "system", label: s.themeSystem },
];

const WEEK_START_SEGMENTS: { key: string; label: string }[] = [
  { key: "0", label: s.weekStartSunday },
  { key: "1", label: s.weekStartMonday },
];

export default function SettingsScreen() {
  const themeMode = usePreferences((st) => st.themeMode);
  const accentKey = usePreferences((st) => st.accentKey);
  const weekStart = usePreferences((st) => st.weekStart);
  const setThemeMode = usePreferences((st) => st.setThemeMode);
  const setAccentKey = usePreferences((st) => st.setAccentKey);
  const setWeekStart = usePreferences((st) => st.setWeekStart);

  const [busy, setBusy] = useState(false);
  const version = Constants.expoConfig?.version ?? "—";

  const onExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await exportData();
      if (!result.ok) {
        Alert.alert(s.exportEmptyTitle, s.exportEmptyBody);
      } else if (result.sharedUnavailable) {
        Alert.alert(s.sharingUnavailableTitle, s.sharingUnavailableBody);
      }
      // On success with sharing available, the OS share sheet is the confirmation.
    } catch (error) {
      logger.error("settings: export failed", { error });
      Alert.alert(s.exportFailedTitle, s.exportFailedBody);
    } finally {
      setBusy(false);
    }
  };

  const runImport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const outcome = await importData();
      if (outcome.status === "imported") {
        Alert.alert(
          s.importSuccessTitle,
          s.importSuccessBody(outcome.habitCount, outcome.checkinCount),
        );
      } else if (outcome.status === "invalid") {
        Alert.alert(s.importInvalidTitle, s.importInvalidBody);
      }
      // "canceled" → do nothing.
    } catch (error) {
      logger.error("settings: import failed", { error });
      Alert.alert(s.importFailedTitle, s.importFailedBody);
    } finally {
      setBusy(false);
    }
  };

  // Import replaces all data — confirm the destructive action before opening the picker (§8).
  const onImport = () => {
    Alert.alert(s.importConfirmTitle, s.importConfirmBody, [
      { text: strings.common.cancel, style: "cancel" },
      { text: s.importConfirmAction, style: "destructive", onPress: runImport },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space[4],
          paddingTop: space[6],
          paddingBottom: space[12],
          gap: space[6],
        }}
      >
        <Text variant="headline.large" color="onBackground">
          {s.title}
        </Text>

        <SettingsSection title={s.appearanceSection}>
          <SettingsRow
            label={s.themeModeLabel}
            description={s.themeModeDescription}
            stack
            right={
              <SegmentedControl
                segments={THEME_SEGMENTS}
                selected={themeMode}
                onSelect={setThemeMode}
                accessibilityLabel={s.a11yThemeMode}
              />
            }
          />
          <SettingsRow
            label={s.accentLabel}
            description={s.accentDescription}
            stack
            right={<ColorPicker value={accentKey} onChange={setAccentKey} />}
          />
        </SettingsSection>

        <SettingsSection title={s.generalSection} footer={s.weekStartDescription}>
          <SettingsRow
            label={s.weekStartLabel}
            stack
            right={
              <SegmentedControl
                segments={WEEK_START_SEGMENTS}
                selected={String(weekStart)}
                onSelect={(key) => setWeekStart(Number(key) as WeekStart)}
                accessibilityLabel={s.a11yWeekStart}
              />
            }
          />
        </SettingsSection>

        <ReminderSettings />

        <SettingsSection title={s.dataSection} footer={s.dataDescription}>
          <SettingsRow
            label={s.exportLabel}
            description={s.exportDescription}
            icon="export-variant"
            onPress={onExport}
            accessibilityLabel={s.a11yExport}
          />
          <SettingsRow
            label={s.importLabel}
            description={s.importDescription}
            icon="import"
            onPress={onImport}
            accessibilityLabel={s.a11yImport}
          />
        </SettingsSection>

        <SettingsSection title={s.aboutSection}>
          <SettingsRow
            label={s.versionLabel}
            icon="information-outline"
            right={
              <Text variant="body.large" color="onSurfaceVariant">
                {s.versionValue(version)}
              </Text>
            }
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
