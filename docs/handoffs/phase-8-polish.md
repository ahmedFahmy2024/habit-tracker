# Phase 8 Handoff — Polish, a11y, performance (ship-quality)

**Status:** ✅ complete · **Date:** 2026-07-23
**Verified by:** `tsc --noEmit` clean · `expo lint` 0 warnings · `expo-doctor` 20/20 · domain
suite **35/35 green** (accent/CheckControl changes didn't touch the domain; week-start still
display-only) · **local `expo prebuild --platform android` succeeds clean** (config valid) ·
**on-device (Android emulator Pixel_10, Expo Go):** closed all three inherited Phase-7 gaps with
screenshots, verified the accent-preference re-tint, dynamic-type scaling to 1.5×, and the full
core loop. *(iOS unverified — no macOS host. True production cold-start timing needs a release
build / EAS Observe — see Gotchas.)*

## What this phase delivered
Maps to [build-plan.md](../build-plan.md) §Phase 8 tasks. **The first task was closing the
Phase-7 on-device gap** (a prerequisite for Phase 8's done-when); all three are now closed:

- **(a) Dark surfaces flip (`.dark:root` fix) — CONFIRMED LIVE.** Toggling Settings → Theme →
  **Dark** instantly flips the NativeWind *surfaces* (background + `surfaceContainer*`) to the
  dark tonal palette across **Today / Habits / Settings** — not just habit colors / native tabs.
  The `.dark:root` fix from Phase 7 is proven on-device. No reload needed; instant re-theme.
- **(b) Export → wipe → import round-trip — CONFIRMED LIVE lossless.** Export opened the OS share
  sheet with `happit-backup-2026-07-23.json`. A pushed backup (2 habits + 3 check-ins) was
  imported via the document picker (destructive replace-all confirm → SAF `content://` read →
  validate → replace-all transaction): **"Restored 2 habits and 3 check-ins."** Today/Habits then
  showed exactly the imported data (streaks recomputed from the imported days: 🔥 2), and the
  pre-import habit was gone (replace-all wiped it).
- **(c) Week-start reorders display — CONFIRMED LIVE.** With week-start **Monday** the
  CadencePicker weekday chips read `M T W T F S S`; switching to **Sunday** → `S M T W T F S` —
  the **same** Mon–Fri selection preserved, only the display order rotated (domain untouched).

Then the ship-quality work:

- **Accent-preference effect wired (decided with the user: FAB + primary buttons + Today
  ring/header).** New `useAccent()` hook (`src/theme/useTheme.ts`) resolves the persisted
  `accentKey` into its tonal palette for the active scheme — the ONE place chrome reads the
  accent. Consumers re-tint from that single preference: **`FAB`**, **`Button`** (all four
  variants), **`ProgressRing`** (default arc), **`CompletionSummary`** ("All done!"). Per-habit
  surfaces (cards, `CheckControl`) keep their OWN habit color via `useHabitColors` — the accent
  never overrides those. **Verified live:** selecting the purple accent re-tinted the FAB, the
  "Create habit" filled button, and the Today progress ring to purple, while the teal/blue habit
  cards stayed their own colors.
- **New `onAccent` palette token** (`src/theme/habitColors.ts`) — the AA-checked on-color for the
  saturated `accent` fill: white on the mid-tone light accents (≥5.5:1 across all 8 hues), black
  on the light dark-scheme pastels (≥12:1). Powers both the global accent chrome and (now)
  `CheckControl`'s check mark (was `colors.surface` — swapped to the semantic `onAccent`).
- **`Text.colorValue`** — a raw-color override (mirrors `Icon.colorValue`) for the per-user accent
  on-color; `color` (a role) stays the default everywhere else.
- **ui-rules §1 audit** — every screen passes: tokens/roles only (no raw hex/magic numbers);
  theme-driven color (one variable switch, no inline light/dark branches); motion + haptics on
  every interactive element (all built on `Pressable`, which guarantees press-scale + haptic +
  ≥48dp hitSlop + reduced-motion); AA contrast (token pairs pre-checked); one accent per surface
  (habit cards use their own color, chrome uses the global accent).
- **A11y pass (ui-rules §8)** — `accessibilityRole` + `accessibilityLabel` on every control;
  `accessibilityState={{ checked }}` on `CheckControl`, `{ selected }` on pickers/segments,
  `{ disabled }` on disabled controls; **dynamic type scales to 1.5× without clipping** (verified
  on-device — text reflows/wraps, cards grow; the detail hero streak number scales); color is
  never the only signal (selection = ring + scale + check icon; done = shape morph + check;
  missed = `errorContainer` tint + position); hitSlop lifts sub-48dp visuals.
- **Perf vs architecture §9** — stats/streaks memoized in `useHabitStats` (one `useMemo` keyed on
  `(habitAt, checkinsAt, today, id)`), off the render path; the 26-week heatmap renders smoothly
  (seen at 1.5× font with a full year of history). **No theme flash on cold start** — the sync
  prefs hydration paints the correct theme on the first frame (confirmed: dark theme correct from
  the first painted frame on a cold launch).
- **Empty/error/loading states (architecture §8)** audited — all real, none TODO: migration
  loading + failure (full-screen `EmptyState`, never white); no-habits (Today + Habits); nothing
  due today; detail loading gap + not-found; backup outcome Alerts; "All done!" celebration.
- **App icon + splash + app config + local prebuild.** Generated brand assets from the M3 accent
  palette (a green `#386a20` squircle with a bold cream `#fdfcf5` checkmark — the "mark done"
  motif) via a pure-Node pngjs rasterizer (`scripts/gen-icons.mjs`): `icon.png` (1024), the three
  Android adaptive layers, `splash-icon.png` (512), `favicon.png`. Rewrote `app.json`: **name
  `Happit`, slug/scheme `happit`**, cream + dark splash (`resizeMode: contain`, `imageWidth: 160`),
  cream adaptive-icon background, **bundle id `com.happit.app`** (iOS + Android). Removed the
  default `assets/expo.icon` bundle. **`expo prebuild --platform android` succeeds clean**
  (config valid; reverted its managed→bare `package.json` script edits since we stay managed).

## Key files added/changed
- `src/theme/habitColors.ts` — added `onAccent` to `HabitTonalColors` + all 16 palette entries.
- `src/theme/useTheme.ts` — new **`useAccent()`** hook (reads persisted `accentKey`).
- `src/theme/index.ts` — export `useAccent`.
- `src/ui/primitives/FAB.tsx` — background = accent, content = `onAccent` (was `bg-primary`).
- `src/ui/primitives/Button.tsx` — all variants carry the accent (filled/tonal/outlined/text).
- `src/ui/primitives/ProgressRing.tsx` — arc defaults to the accent (`color?` prop to override).
- `src/ui/primitives/Text.tsx` — new `colorValue?` raw-color override.
- `src/ui/habit/CompletionSummary.tsx` — "All done!" uses the accent.
- `src/ui/habit/CheckControl.tsx` — check mark uses the palette `onAccent` (was `colors.surface`).
- `scripts/gen-icons.mjs` — **new** brand-asset generator (pure Node + pngjs).
- `assets/images/*` — regenerated icon / adaptive layers / splash / favicon.
- `assets/expo.icon/` — **removed** (default Expo starter icon bundle).
- `app.json` — name/slug/scheme/splash/adaptive-icon/bundle-id (see above).
- `docs/ui-registry.md` (Text.colorValue, Button accent, `useAccent` note) · `docs/ui-tokens.md`
  §1.3 (`onAccent` token).

## Decisions made (and why) — the three blocking calls, confirmed with the user
- **Accent scope = FAB + primary buttons + Today ring/header** (user picked "both"). The accent
  re-tints neutral interactive chrome, NOT per-habit surfaces (cards keep their own color). The
  `SegmentedControl` selected tint deliberately stays on the neutral M3 `primaryContainer` role
  (out of scope — it's a settings-local control, not a primary action); the `TextField` focus
  ring likewise stays `primary`. Documented in ui-registry §Button.
- **Icon/splash = generated M3 placeholder** (user chose generate). Green squircle + cream check,
  drawn deterministically from the palette via pngjs (no sharp/SVG rasterizer available on this
  host). Replaceable later by re-running `scripts/gen-icons.mjs` with new colors, or dropping in
  real art.
- **EAS = local prebuild only** (user chose; no account-touching action). `expo prebuild` +
  `expo config` + `expo-doctor` prove the config is valid and generates native projects; the real
  cloud build/submit is deferred. No Expo credentials were entered.

## Gotchas / things the next agent must know
- **The benign yellow "!" dev toast is `react-native-draggable-flatlist`'s `InteractionManager`
  deprecation warning** (LogBox `Console Warning`, fired from `DraggableFlatList.tsx:122` when the
  Habits tab mounts). It is NOT our code and NOT an error — but it's persistent and its invisible
  bottom overlay can intercept taps on bottom-pinned buttons in Expo Go. Reloading clears it. A
  reasonable future cleanup: `LogBox.ignoreLogs(['InteractionManager has been deprecated'])`.
- **Metro `--clear` + a dev-menu Reload is required after changing a deeply-imported primitive.**
  The accent change to `ProgressRing` looked broken (ring stayed green = `primary`) through several
  deep-link "reloads" — those hit an already-loaded app that never re-fetched. Only killing Metro,
  restarting with `--clear`, and tapping the **dev-menu Reload** (which forces a fresh bundle
  fetch — confirm a new "Android Bundled" line) actually applied it. Don't trust a deep-link alone
  to reload a changed module.
- **`useAccent()` imports `usePreferences` from `@/store`** (not the `@/theme` barrel). No new
  require cycle: `preferences.ts` imports `@/theme/habitColors` *directly* (a leaf), so the chain
  `useTheme → @/store → preferences → @/theme/habitColors` has no edge back to the theme barrel.
- **Icon/splash/name are NOT visible in Expo Go** — Expo Go shows its own icon/manifest; the new
  branding only applies in a dev-client or production build. The config is proven by prebuild +
  `expo config`, not by an Expo Go screenshot.
- **Production cold-start (< 1.5s) can't be truthfully measured in Expo Go** — the dev bundle is
  downloaded over the Metro bridge and runs with dev transforms/assertions (the launch measured
  ~2s+ *including* the bundle download). Production embeds precompiled Hermes bytecode (no
  download, no dev overhead). The architecture is built for the budget (Hermes, sync prefs
  hydration → no flash, tiny 2-table migration, memoized O(history) stats) — a real number needs a
  **release build / EAS Observe**, which is deferred with the local-prebuild-only decision.
- **`expo prebuild` rewrites `package.json` scripts** (`expo start --android` → `expo run:android`)
  and adds `android.package` — since this project stays **managed** (no committed `android/`/`ios/`),
  those script edits were reverted and the generated `android/` dir deleted (both gitignored).
- **On-device flakiness stayed environmental** — the Pixel_10 AVD needs `-memory 3072` (Phase-6),
  and an `adb shell am broadcast`/`am start` left backgrounded can wedge the adb transport (0-byte
  screencaps / `adb devices` timeouts). Recovery: kill stray `adb.exe`, `adb start-server`,
  `adb reverse tcp:8081 tcp:8081`.

## What is NOT done yet (deferred)
- **iOS unverified** — Android emulator only (no macOS host). Re-check the icon/splash, accent
  re-tint, dynamic type, and dark surfaces on iOS when a Mac is available.
- **Real EAS cloud build/submit** — deferred by decision. `app.json` + a local prebuild are proven
  clean; a real store build needs the user's Expo account + credentials (use the
  `eas-app-stores` skill then).
- **Production cold-start measurement** — needs a release build / EAS Observe (see Gotchas).
- **`InteractionManager` deprecation warning** from draggable-flatlist — left as-is (a
  `LogBox.ignoreLogs` suppression is a reasonable tidy-up).
- **Brand art is a generated placeholder** — swap in real art (or re-run `gen-icons.mjs` with the
  finalized accent hue) when the source color is locked (still an open question in
  [ui-tokens.md](../ui-tokens.md) §1.2 / progress-tracker parking lot).

## Next phase
- **None — v1 is feature-complete.** All 8 build-plan phases are done and the ranked
  [project-overview.md](../project-overview.md) §3 goals are demonstrably met on the Pixel_10:
  frictionless <5s check-in, genuinely M3 Expressive (springy CheckControl morph, tonal color,
  big "All done!" type), trustworthy streaks/history (🔥 recomputed from imported check-ins; 35
  domain tests), and zero data loss (lossless export/import + migrations). Remaining work is
  release logistics (real EAS build, iOS verification, finalized brand art) — not new features.
