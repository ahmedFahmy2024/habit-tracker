import "@/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ReminderSync } from "@/data/ReminderSync";
import { WidgetSync } from "@/data/WidgetSync";
import { MigrationGate } from "@/db/MigrationGate";
import { strings } from "@/lib";
import { ThemeSync } from "@/theme";

/**
 * Root layout. Provider order (docs/architecture.md §6):
 *   GestureHandlerRoot → StatusBar → MigrationGate → Stack (tabs + habit routes).
 *
 * MigrationGate runs DB migrations once and holds the UI behind a loading/error screen
 * until they succeed (§8). The (tabs) group holds the three primary tabs; habit/* are
 * pushed/modal routes. global.css is imported here once so NativeWind styles apply app-wide.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <MigrationGate>
        <ThemeSync />
        <ReminderSync />
        <WidgetSync />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="habit/[id]"
            options={{ headerShown: true, title: "Habit" }}
          />
          <Stack.Screen
            name="habit/new"
            options={{
              presentation: "modal",
              headerShown: true,
              title: strings.habitNew.title,
            }}
          />
          <Stack.Screen
            name="habit/edit/[id]"
            options={{
              presentation: "modal",
              headerShown: true,
              title: strings.habitEdit.title,
            }}
          />
        </Stack>
      </MigrationGate>
    </GestureHandlerRootView>
  );
}
