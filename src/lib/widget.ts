/**
 * Home-screen widget wrapper over `react-native-android-widget` — build-plan Phase 10,
 * docs/library-docs.md §14. Mirrors the `src/lib/notifications.ts` / `src/lib/haptics.ts` rule:
 * components/screens NEVER import `react-native-android-widget` directly; they call
 * `publishTodaySnapshot(...)` so the refresh policy lives in exactly one place.
 *
 * This is strictly local: it reads the app's own snapshot and asks the OS to redraw the widget.
 * No network, no accounts, no push (docs/project-overview.md §2/§4).
 *
 * ── Platform scope (Phase 10 decision) ──────────────────────────────────────────────────────
 * Only the **Android** widget is wired this phase (`react-native-android-widget`), verifiable on
 * the Pixel_10. iOS WidgetKit is deferred (needs a macOS host we don't have — see the Phase 10
 * handoff). So every function here is an Android-only effect and a **no-op elsewhere** (web, iOS,
 * and — importantly — when the native module isn't present, e.g. Expo Go). We guard on
 * `Platform.OS === "android"` and lazily `require()` the native module behind a try/catch, the same
 * defensive shape as the reminders wrapper, so importing this file never crashes a non-dev build.
 *
 * ── Snapshot vs render ──────────────────────────────────────────────────────────────────────
 * `writeSnapshot` (in `@/data/widgetSnapshot`) persists the frozen summary; THIS module only asks
 * the OS to redraw from it. `requestWidgetUpdate` triggers the task handler's `renderWidget`, which
 * reads the just-written snapshot. Refreshes are debounced so a burst of check-in toggles coalesces
 * into one redraw.
 */
import { Platform } from "react-native";

import { logger } from "./logger";

/** The widget's `name` — must match the `widgets[].name` in the app.json plugin config. */
export const TODAY_WIDGET_NAME = "Today";

// Lazily-required `react-native-android-widget`. `import type` only, so nothing runs at file load.
// `null` = unavailable (non-Android, or the native module is missing e.g. in Expo Go).
type WidgetModule = typeof import("react-native-android-widget");
let cached: WidgetModule | null | undefined;

/** Lazily get the native widget module, or `null` when it isn't usable on this platform/build. */
function getWidgetModule(): WidgetModule | null {
  if (cached !== undefined) return cached;
  if (Platform.OS !== "android") {
    cached = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require("react-native-android-widget") as WidgetModule;
  } catch (error) {
    // Native module absent (Expo Go / a build without the plugin) — degrade to a no-op.
    logger.warn(
      "widget: react-native-android-widget unavailable; widget updates are inert on this build.",
    );
    logger.error("widget: failed to load native module", { error });
    cached = null;
  }
  return cached;
}

/** Whether the home-screen widget can be updated at all on this build (Android dev build only). */
export function widgetAvailable(): boolean {
  return getWidgetModule() !== null;
}

/* ------------------------------------------------------------------ debounced publish */

// A short debounce so a burst of toggles (e.g. checking several habits quickly) coalesces into one
// redraw instead of one per tap. The snapshot itself is already written synchronously by the caller;
// only the (comparatively expensive) native redraw is debounced.
const DEBOUNCE_MS = 400;
let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * Ask the OS to redraw every "Today" widget on the home screen from the current snapshot. Debounced.
 * Safe to call on any platform/build — a no-op where the widget isn't available. The actual render
 * (reading the snapshot → building the widget tree) happens in the task handler's `renderWidget`,
 * which `requestWidgetUpdate` invokes for each placed widget instance.
 *
 * `renderWidget` is imported lazily *inside* the debounced callback (not at file scope) so this
 * module — imported by the Today screen — never eagerly pulls the widget-UI/JSX graph into the
 * app bundle's import chain on non-Android platforms.
 */
export function publishTodaySnapshot(): void {
  const N = getWidgetModule();
  if (!N) return; // non-Android / Expo Go — inert.

  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void redrawNow(N);
  }, DEBOUNCE_MS);
}

async function redrawNow(N: WidgetModule): Promise<void> {
  try {
    // Lazy import: only load the widget component graph on the Android path, at redraw time.
    const { renderTodayWidget } = await import("@/widget/TodayWidget");
    await N.requestWidgetUpdate({
      widgetName: TODAY_WIDGET_NAME,
      renderWidget: () => renderTodayWidget(),
      // No widgets placed → nothing to do (and no background task to clean up; we don't run one).
      widgetNotFound: () => {},
    });
  } catch (error) {
    logger.error("widget: requestWidgetUpdate failed", { error });
  }
}
