/**
 * App entry point (build-plan Phase 10).
 *
 * We override Expo Router's default entry (`expo-router/entry`) with this file so we can ALSO
 * register the home-screen widget's headless task handler at startup. This is the canonical
 * Expo-Router setup for `react-native-android-widget`, verified from its docs
 * (`docs/tutorial/register-task-handler.md`): import the router entry for its side-effects, then
 * `registerWidgetTaskHandler`. `package.json`'s `main` points here instead of `expo-router/entry`.
 *
 * The widget module is Android-only; on other platforms `registerWidgetTaskHandler` is imported but
 * the task simply never fires (the OS side doesn't exist). Importing it is harmless — it only calls
 * `AppRegistry.registerHeadlessTask`.
 */
import "expo-router/entry";

import { registerWidgetTaskHandler } from "react-native-android-widget";

import { widgetTaskHandler } from "@/widget/widgetTaskHandler";

registerWidgetTaskHandler(widgetTaskHandler);
