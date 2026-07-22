import "@/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * Root layout. Provider order (docs/architecture.md §6):
 *   GestureHandlerRoot → StatusBar → Stack (tabs + habit routes).
 *
 * The (tabs) group holds the three primary tabs; habit/* are pushed/modal routes.
 * global.css is imported here once so NativeWind styles apply app-wide.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
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
            title: "New Habit",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
