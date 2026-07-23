/**
 * Deep-link landing route for the home-screen widget (build-plan Phase 10).
 *
 * The widget's tap action is `OPEN_URI` → `happit://today` (scheme `happit` in app.json). Expo
 * Router maps that URI's path (`/today`) to THIS route, which immediately redirects to the Today
 * tab (the `(tabs)` index, `/`). A dedicated redirect route is more robust than relying on
 * empty-path resolution and keeps the widget's link target explicit and stable.
 *
 * There is no UI here — `<Redirect>` swaps the route before anything paints, so tapping the widget
 * lands the user on Today with the normal tab bar, exactly as if they'd opened the app.
 */
import { Redirect } from "expo-router";

export default function TodayDeepLink() {
  return <Redirect href="/" />;
}
