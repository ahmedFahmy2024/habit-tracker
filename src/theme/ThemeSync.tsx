/**
 * ThemeSync — bridges the persisted `themeMode` preference to NativeWind's color scheme.
 *
 * NativeWind natively understands `"light" | "dark" | "system"` via `setColorScheme` (verified
 * from the installed `nativewind`/`react-native-css-interop` source): `"system"` follows the OS
 * appearance (no manual `.dark` class juggling), and explicit `"light"`/`"dark"` override it.
 * Applying the mode here flips the single `.dark` variable switch app-wide, so every tab and
 * screen re-themes instantly — there are no inline `light`/`dark` branches anywhere (ui-rules §2).
 *
 * `useTheme()` keeps reading NativeWind's *resolved* scheme, so it needs no change: once
 * `setColorScheme` runs, `useTheme().scheme` reflects the effective light/dark.
 *
 * Mounted INSIDE the MigrationGate so that the one-time `hydrate()` re-read happens after the
 * `key_value` table exists (on a fresh install the store may have hydrated to defaults at module
 * load, before migrations created the table). Renders nothing.
 */
import { useColorScheme } from "nativewind";
import { useEffect } from "react";

import { usePreferences } from "@/store";

export function ThemeSync() {
  const { setColorScheme } = useColorScheme();
  const themeMode = usePreferences((s) => s.themeMode);
  const hydrate = usePreferences((s) => s.hydrate);

  // Re-read persisted prefs once the DB is guaranteed migrated (see note above).
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Apply the mode to NativeWind whenever it changes (and on first mount). Instant re-theme.
  useEffect(() => {
    setColorScheme(themeMode);
  }, [themeMode, setColorScheme]);

  return null;
}
