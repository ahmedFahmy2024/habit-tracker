/**
 * Widget task handler (build-plan Phase 10) — registered in the app entry (`index.ts`) via
 * `registerWidgetTaskHandler`. This is the **headless background task** the OS invokes for widget
 * lifecycle events; it must be self-contained (no app UI, no hooks) and just draw the current
 * snapshot.
 *
 * Verified against react-native-android-widget@0.21.0
 * (`src/api/register-widget-task-handler.tsx`): the handler receives `widgetInfo`, `widgetAction`
 * (`WIDGET_ADDED` | `WIDGET_UPDATE` | `WIDGET_RESIZED` | `WIDGET_DELETED` | `WIDGET_CLICK`), and a
 * `renderWidget(rep)` callback.
 *
 * Actions:
 *   • WIDGET_ADDED   — user just placed the widget → draw it immediately from the snapshot.
 *   • WIDGET_UPDATE  — OS periodic/day-rollover tick → redraw from the (freshly re-read) snapshot,
 *                      which applies the day-rollover reset inside `renderTodayWidget`.
 *   • WIDGET_RESIZED — redraw so the layout re-fits.
 *   • WIDGET_DELETED — nothing to do (the library ignores `renderWidget` for deletes anyway).
 *   • WIDGET_CLICK   — not used: taps use `clickAction: "OPEN_URI"`, which the native side handles
 *                      as a deep link WITHOUT routing through here. Kept for completeness.
 *
 * `renderTodayWidget()` returns the `{ light, dark }` representation from the snapshot, so every
 * path here re-reads the latest published data.
 */
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { logger } from "@/lib/logger";
import { TODAY_WIDGET_NAME } from "@/lib/widget";
import { renderTodayWidget } from "./TodayWidget";

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  // We only own the "Today" widget; ignore anything else defensively.
  if (props.widgetInfo.widgetName !== TODAY_WIDGET_NAME) return;

  try {
    switch (props.widgetAction) {
      case "WIDGET_ADDED":
      case "WIDGET_UPDATE":
      case "WIDGET_RESIZED":
        props.renderWidget(renderTodayWidget());
        break;
      case "WIDGET_DELETED":
      case "WIDGET_CLICK":
      default:
        break;
    }
  } catch (error) {
    logger.error("widgetTaskHandler failed", {
      action: props.widgetAction,
      error,
    });
  }
}
