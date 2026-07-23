# Phase 7 — What got stuck (on-device verification blockers)

**Date:** 2026-07-23 · **Status:** code complete + static/logic-verified; **live on-device pass NOT finished**.

This is a scratch note (not the formal handoff) describing exactly where Phase 7 got blocked, so
the next session can pick up the *one remaining thing*: confirm the dark-theme fix renders on the
Pixel_10. Everything else in Phase 7 is done and green.

---

## TL;DR

- **All Phase 7 code is written and passes `tsc --noEmit` (0), `expo lint` (0 warnings),
  `expo-doctor` (20/20), and the 35 domain tests.** A throwaway Node script also proved the
  week-order rotation and the backup validate/round-trip logic (all cases pass).
- **On device I got the Settings screen rendering correctly** (theme segmented control, accent
  swatch grid, week-start toggle, Export/Import rows, About+version) and confirmed prefs persist.
- **I hit TWO real issues while testing on the emulator. I FIXED BOTH IN CODE. I did not get to
  re-confirm the second fix live** because the emulator/adb connection wedged and then the app
  wouldn't reconnect to Metro (Expo Go "Something went wrong" disconnect screen).

---

## Blocker 1 — Require cycle warning (FOUND + FIXED, confirmed gone)

**Symptom:** a yellow LogBox warning banner on every screen:

```
Require cycle: src/theme/index.ts -> src/theme/ThemeSync.tsx -> src/store/index.ts
  -> src/store/preferences.ts -> src/theme/index.ts
```

**Cause:** `preferences.ts` imported `{ HABIT_COLOR_KEYS, HabitColorKey }` from the `@/theme`
barrel. The barrel also re-exports `ThemeSync`, which imports the store — closing the loop.

**Fix (applied):** import from the specific module instead of the barrel:
```ts
// src/store/preferences.ts
import { HABIT_COLOR_KEYS, type HabitColorKey } from "@/theme/habitColors"; // not "@/theme"
```
**Verified:** after a reload, the require-cycle warning was **gone** from a fresh `adb logcat`.

---

## Blocker 2 — Dark theme flips habit colors + native tabs, but NOT the NativeWind surfaces (FOUND + FIXED IN CODE; fix NOT yet confirmed live)

**Symptom:** toggling Theme → **Dark** (or OS night mode + System):
- ✅ habit-accent colors switched to their dark-scheme palette (the `useHabitColors` JS path),
- ✅ the **native** bottom tab bar went dark (it follows RN `Appearance`),
- ❌ but every `className="bg-background"` / `bg-surface*` surface **stayed light cream** — the
  screen background did not flip.

So the JS `colorScheme` observable flipped, but the **NativeWind CSS variables under the dark
block were not applying**.

**Root cause (verified from installed source, not guessed):**
`node_modules/react-native-css-interop/dist/css-to-rn/normalize-selectors.js` →
`isRootDarkVariableSelector()`. On native, dark **CSS variables** are only registered when the
dark block uses the selector **`.dark:root { … }`** (or `:root[class~="dark"]`). Our
`src/global.css` used a **bare `.dark { … }`**, which the compiler treats as a *descendant style
rule* (`isDarkClassSelector`), **not** as a dark-variable source — so the dark `--background`,
`--surface`, etc. never took effect and surfaces fell back to the light `:root` values.

> Why this was never caught before Phase 7: no prior phase actually eyeballed dark **surfaces** on
> a device. Phase 0/1 handoffs both explicitly deferred the "dark-mode pixel flip" visual check.
> Phase 7 is the first screen that toggles theme in-app, so it's the first time the latent
> `global.css` selector bug became visible.

**Fix (applied):** `src/global.css`
```css
/* was:  .dark {           */
.dark:root {
  --primary: #9cd67d;
  ...
}
```
A NativeWind-config change, so it needs a **Metro restart with `--clear`** (done). `tsc`/`lint`
still clean after the change.

**Status of this fix:** **NOT yet confirmed on-device.** Right after the `--clear` restart, the
emulator/adb link wedged (see Blocker 3) before I could screenshot the dark surfaces flipping.
The fix is well-grounded in the installed source, but it still needs a live confirmation screenshot.

---

## Blocker 3 — adb / emulator connection wedged, then Expo Go wouldn't reconnect (environment, not app code)

After the `--clear` restart:
- `adb exec-out screencap` started returning **0-byte** files, and `adb devices` began **timing
  out** (exit 137). A backgrounded `adb shell am start` had held the transport.
- I force-killed the stray `adb.exe` (PID) and `adb start-server` brought the daemon back
  (`emulator-5554  device` visible again).
- But re-deep-linking Expo Go now lands on **"Something went wrong. …try to reload the project."**
  — the classic Metro-disconnect screen. No **new** bundle was served after the reconnect (Metro
  log's last "Android Bundled … (2298 modules)" is unchanged), i.e. Expo Go never re-fetched.
- I was about to (a) re-assert `adb reverse tcp:8081 tcp:8081`, (b) confirm Metro reachable
  (`curl localhost:8081/status`), and (c) tap Expo Go's in-app reload (↻) — **the user stopped the
  test here.**

This is an environment/tooling wedge, **not** an app bug. The app previously loaded fine (2298
modules, no red-box) on this same bundle before the adb restart.

---

## What is verified vs. not

| Item | Verified? | How |
| --- | --- | --- |
| Settings screen renders (all sections, tokens, neutral) | ✅ live | screenshots before the wedge |
| Prefs persist (theme/accent/week-start) | ✅ live | selections held across nav; sqlite `key_value` |
| Theme mode drives NativeWind (habit colors + native tabs flip) | ✅ live | dark palette + dark tab bar seen |
| **Dark NativeWind SURFACES flip** (the `.dark:root` fix) | ❌ **pending** | fix applied; needs a live screenshot |
| Week-start reorders chips/legend, domain untouched | ✅ logic | Node script + 35 domain tests green; not re-shot live |
| Export → wipe → import round-trip lossless | ❌ **pending** | validate/round-trip proven in Node; not exercised live |
| tsc / lint / expo-doctor | ✅ | 0 / 0 / 20-of-20 |

---

## Exact next steps to finish (cold-start friendly)

1. Ensure the emulator is up (`adb devices` shows `emulator-5554 device`). If wedged again:
   kill stray `adb.exe`, `adb start-server`, `adb reverse tcp:8081 tcp:8081`.
2. Metro is (or restart it) on 8081 in CI mode: `CI=1 EXPO_NO_TELEMETRY=1 bunx expo start --port 8081`
   (add `--clear` since `global.css` changed if it wasn't already cleared this session).
3. Foreground Expo Go, deep-link `exp://127.0.0.1:8081`. If "Something went wrong", tap the in-app
   **reload (↻)** or force-stop + cold relaunch (AGENTS.md §3 playbook).
4. **Confirm Blocker-2 fix:** Settings → Theme **Dark**. The **background/surfaces must now turn
   dark** (not just habit colors). Toggle Light/Dark/System and confirm instant re-theme across
   Today/Habits/Settings. Screenshot each.
5. Change accent + week-start; open a habit's detail + the add/edit CadencePicker and confirm the
   weekday chips/heatmap legend reorder while the habit's schedule/streak are unchanged.
6. **Core done-when:** create/keep a habit with check-ins → Settings → **Export** (share sheet
   appears) → delete the habit (or import a wipe) → **Import** the file → confirm all habits +
   check-ins round-trip. Screenshot before/after.
7. Screenshots into `.device-shots/` inside the repo, Read them, then `rm -rf .device-shots`.
8. Then write the real `docs/handoffs/phase-7-settings.md` (template in AGENTS.md), update
   `docs/handoffs/README.md` + `docs/progress-tracker.md` (flip Phase 7 ✅, new registry rows 🟢,
   note the new deps + the `preferences` store + the `.dark:root` gotcha).

---

## Files changed this session (all lint/tsc-clean)

- `src/store/preferences.ts` **(new)** — zustand prefs store, sqlite-hydrated (sync, no flash).
- `src/store/index.ts` **(new)** — store barrel.
- `src/lib/weekOrder.ts` **(new)** — pure `weekdayDisplayOrder` / `reorderBySunday` (display-only).
- `src/lib/index.ts` — export weekOrder; removed the now-superseded `WEEKDAY_DISPLAY_ORDER`.
- `src/lib/cadence.ts` — dropped `WEEKDAY_DISPLAY_ORDER` (superseded).
- `src/lib/strings.ts` — fleshed-out `settings.*` copy.
- `src/data/backup.ts` **(new)** — export/import (File/Paths + Sharing + DocumentPicker; replace-all
  in one `withTransactionSync`; versioned + validated).
- `src/db/schema.ts` — added `key_value` table (prefs); migration `0001_lush_obadiah_stane.sql`
  generated + bundled in `migrations.js`.
- `src/theme/ThemeSync.tsx` **(new)** — applies `themeMode` via NativeWind `setColorScheme`;
  re-hydrates prefs post-migration.
- `src/theme/index.ts` — export `ThemeSync`.
- `src/theme/useTheme.ts` — unchanged (still reads the resolved scheme).
- `src/app/_layout.tsx` — mounted `<ThemeSync/>` inside `MigrationGate`.
- `src/app/(tabs)/settings.tsx` — the real thin Settings screen.
- `src/ui/primitives/SegmentedControl.tsx` **(new)** + barrel export.
- `src/ui/settings/{SettingsSection,SettingsRow,index}.tsx` **(new)**.
- `src/ui/habit/CadencePicker.tsx` — weekday chips use `weekdayDisplayOrder(weekStart)`.
- `src/ui/habit/Heatmap.tsx` — legend + row order rotate by `weekStart` (display-only).
- **`src/global.css` — `.dark` → `.dark:root` (Blocker-2 fix).**
- `docs/library-docs.md` — recorded the 3 new deps (§12) + the sqlite-prefs decision (§8).
- `docs/ui-registry.md` — `SegmentedControl`, `SettingsSection`, `SettingsRow` specs (🟢);
  AccentPicker = reuse `ColorPicker`.
