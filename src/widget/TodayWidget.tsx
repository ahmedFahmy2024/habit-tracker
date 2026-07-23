/**
 * The home-screen widget UI (build-plan Phase 10, docs/library-docs.md §14).
 *
 * Rendered with `react-native-android-widget`'s JSX primitives (`FlexWidget`/`TextWidget`/
 * `SvgWidget`) → Android RemoteViews. It shows **today's completion ring + top streak**, read from
 * the frozen snapshot (`@/data/widgetSnapshot`). It NEVER derives streaks — it only reads the
 * numbers the Today screen already computed and published (docs/architecture.md §7.3).
 *
 * ── Headless-safe ────────────────────────────────────────────────────────────────────────────
 * This runs both in the app process and in the widget's headless background task. So it uses NO
 * React hooks, NO theme context, NO `useLiveQuery` — just the sync snapshot read + plain values.
 * Colors are fixed M3 surface/on-surface values baked in here (light + dark variants), because the
 * task has no `useTheme`. The accent (ring color) comes from the snapshot (the user's global accent).
 *
 * ── Day rollover ─────────────────────────────────────────────────────────────────────────────
 * If the snapshot's `date` is not today's local day, the day has rolled over since the last publish
 * (the app may not have been opened). We render a fresh, empty ring for the new day rather than
 * yesterday's stale progress — satisfying "day rollover resets the ring" without needing the app to
 * run. The counts show 0/0 until the app next opens and republishes the real total.
 *
 * ── Tap ──────────────────────────────────────────────────────────────────────────────────────
 * The whole widget is a click target that deep-links to Today via `OPEN_URI` → `happit://today`
 * (scheme `happit` in app.json). See `src/app/_layout.tsx` for the route handling.
 */
import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from "react-native-android-widget";

import { todayString } from "@/lib/date";
import type { WidgetRepresentation } from "react-native-android-widget";

import { readSnapshot, type WidgetSnapshot } from "@/data/widgetSnapshot";
import { ringSvg } from "./ring";

/** Deep link the widget opens on tap (scheme `happit`, Today route). */
const TODAY_URI = "happit://today";

/** Fixed M3-ish widget palette per scheme (no theme hooks available in the headless task). */
const PALETTE = {
  light: {
    surface: "#fdfcf5", // background (matches app.json splash bg)
    onSurface: "#1a1c18",
    onSurfaceVariant: "#43483e",
    track: "#dbe5cf", // low-chroma surface container
  },
  dark: {
    surface: "#1a1c18",
    onSurface: "#e2e3dc",
    onSurfaceVariant: "#c3c8bb",
    track: "#3a3f36",
  },
} as const;

type Scheme = keyof typeof PALETTE;

/** Streak line, e.g. "🔥 5 day streak" / "🔥 3 week streak", or a quiet zero state. */
function streakLabel(snapshot: WidgetSnapshot): string {
  if (snapshot.topStreak <= 0) return "No streak yet";
  const unit =
    snapshot.topStreakUnit === "weeks"
      ? snapshot.topStreak === 1
        ? "week"
        : "weeks"
      : snapshot.topStreak === 1
        ? "day"
        : "days";
  return `🔥 ${snapshot.topStreak} ${unit} streak`;
}

/**
 * Build the widget JSX for one scheme from a (possibly rolled-over) snapshot. `done`/`total` are the
 * effective values after the rollover check.
 */
function widgetTree(
  scheme: Scheme,
  done: number,
  total: number,
  snapshot: WidgetSnapshot,
): React.JSX.Element {
  const c = PALETTE[scheme];
  const value = total > 0 ? done / total : 0;
  const size = 96;
  const strokeWidth = 10;
  const centerText = total > 0 ? `${done}/${total}` : "—";

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: TODAY_URI }}
      accessibilityLabel={`Happit: ${done} of ${total} habits done today. ${streakLabel(snapshot)}. Tap to open.`}
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: c.surface,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 16,
      }}
    >
      {/* Ring with the done/total count centered inside it. OverlapWidget = FrameLayout, so the
          SVG and the count stack; both fill the frame and center their content. */}
      <OverlapWidget
        style={{
          height: size,
          width: size,
        }}
      >
        <SvgWidget
          svg={ringSvg({
            value,
            size,
            strokeWidth,
            color: snapshot.accentColor,
            trackColor: c.track,
          })}
          style={{ height: size, width: size }}
        />
        <FlexWidget
          style={{
            height: size,
            width: size,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text={centerText}
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: c.onSurface,
              textAlign: "center",
            }}
          />
        </FlexWidget>
      </OverlapWidget>

      {/* Title + streak. */}
      <FlexWidget
        style={{
          flex: 1,
          height: "match_parent",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingLeft: 12,
        }}
      >
        <TextWidget
          text="Today"
          style={{ fontSize: 15, fontWeight: "500", color: c.onSurfaceVariant, textAlign: "right" }}
        />
        <TextWidget
          text={streakLabel(snapshot)}
          truncate="END"
          maxLines={1}
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: c.onSurface,
            textAlign: "right",
            marginTop: 2,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * A neutral empty widget shown when there is no snapshot yet (widget added before the app ever
 * published). Prompts the user to open the app.
 */
function emptyTree(scheme: Scheme): React.JSX.Element {
  const c = PALETTE[scheme];
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: TODAY_URI }}
      accessibilityLabel="Happit. Open the app to see today's progress."
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.surface,
        borderRadius: 24,
        padding: 16,
      }}
    >
      <TextWidget
        text="Happit"
        style={{ fontSize: 18, fontWeight: "700", color: c.onSurface, textAlign: "center" }}
      />
      <TextWidget
        text="Open the app to see today's progress"
        style={{ fontSize: 13, color: c.onSurfaceVariant, textAlign: "center", marginTop: 4 }}
      />
    </FlexWidget>
  );
}

/**
 * Render the widget representation (light + dark variants) from the current snapshot. Applies the
 * day-rollover reset: if the snapshot is from a previous day, today's counts start at 0/0 (a fresh
 * ring) so a rolled-over widget never shows yesterday's completion. The library picks the light or
 * dark tree based on the system theme at draw time.
 *
 * This is the single entry the wrapper (`src/lib/widget.ts`) and the task handler both call.
 */
export function renderTodayWidget(): WidgetRepresentation {
  const snapshot = readSnapshot();
  if (!snapshot) {
    return { light: emptyTree("light"), dark: emptyTree("dark") };
  }

  const isToday = snapshot.date === todayString();
  // Rolled over → reset the ring to an empty new day (counts 0/0 until the app republishes).
  const done = isToday ? snapshot.done : 0;
  const total = isToday ? snapshot.total : 0;

  return {
    light: widgetTree("light", done, total, snapshot),
    dark: widgetTree("dark", done, total, snapshot),
  };
}
