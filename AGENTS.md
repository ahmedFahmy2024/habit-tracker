# AGENTS.md — Happit

Rules every coding agent (and human) must follow in this repo. Read this before writing code.

---

## ⚠️ Expo has changed — this project is SDK 57

- Target: **Expo SDK 57**, React **19.2**, React Native **0.86**, Reanimated **4.5**.
- Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing
  any Expo code. Do **not** assume older-SDK APIs.
- `docs/` may still reference SDK 54 in places — `package.json` is the source of truth for
  versions; fix the docs when you touch them.

---

## 📖 Source of truth for any library: opensrc first

**When working with any third-party library, framework, SDK, or CLI, do NOT rely on the
model's training data for its API.** Training data is stale and hallucinates APIs. Instead:

### The lookup order (follow it in order, stop when you have the answer)

1. **`opensrc` — the actual source code of the version we use.** This is the primary and
   most authoritative source. It is the *real* code of the *exact version* installed in
   this project. Read it before writing any integration.
2. **Context7 MCP** — only if `opensrc` doesn't resolve the question (e.g. you need
   conceptual/guide-level docs, migration notes, or a package opensrc can't fetch). Use it
   as documentation, not as a substitute for reading source.
3. **Official versioned docs** (e.g. the SDK-57 Expo docs above) for narrative/setup guides.
4. **Training-data recall is the last resort**, and anything recalled this way must be
   verified against opensrc/Context7 before it lands in code. Never ship an API you only
   "remember".

> Rule of thumb: **if you're about to write `import { X } from 'some-lib'` and call `X`,
> you must have seen `X` in opensrc (or Context7) for the installed version first.**

### How to use opensrc

`opensrc` is installed globally. `opensrc path <spec>` prints the absolute path to a
package's cached source (fetching on first use), so compose it inside shell tools. It
auto-detects the version from this project's `node_modules`/lockfile, so pass `--cwd` here
to get *our* version:

```bash
# Read a file from the exact installed version:
cat "$(opensrc path --cwd . expo-router)/package.json"

# Search a package's source for a symbol/API:
rg "useLiveQuery" "$(opensrc path --cwd . drizzle-orm)"

# Explore a package's structure:
ls "$(opensrc path --cwd . react-native-reanimated)/src"

# GitHub repo directly (owner/repo), or other registries:
rg "NativeTabs" "$(opensrc path expo/expo)/packages/expo-router/src"
```

Registry prefixes: npm (none), `pypi:`, `crates:`, `owner/repo` for GitHub, `gitlab:`,
`bitbucket:`. Cache lives in `~/.opensrc/`. Use `opensrc list` to see what's cached and
`opensrc fetch <spec…>` to pre-populate.

**Verify the version.** After `opensrc path`, confirm the resolved path's version matches
`package.json`. If opensrc returns an older cached version, re-run with `--cwd .` (or
`opensrc fetch` the right version) so you're reading the code we actually run — not a stale
clone from another project's cache.

### When adding a new dependency

1. `opensrc fetch <package>` (or let `opensrc path` fetch it) and **read its real API from
   source** before wiring it in.
2. Record it in [docs/library-docs.md](docs/library-docs.md) with the resolved version and
   the verified setup.

---

## 🧩 Skills

- Prefer the **skills** available in this environment for setup/config tasks (e.g. NativeWind
  setup, Reanimated animations, Expo Router, testing). They encode current, correct steps.
- Use **`find-skills`** to discover and install a skill when a task would benefit from one
  we don't have yet, instead of guessing.
- A skill is a shortcut to correct steps; it does **not** override the opensrc-first rule
  for a library's actual API surface.

---

## 📱 On-device verification (Android emulator + Expo Go)

Every phase with UI must be verified live on the **Pixel_10** Android emulator through **Expo
Go** (`host.exp.exponent`) before the handoff — same flow since Phase 2. This is a **Windows +
Git Bash** host; the steps below encode the exact failures hit in earlier phases so they don't
recur. **Do them in order; don't improvise a shortcut that skipped a step last time.**

`adb` and `emulator` are on PATH (under `~/AppData/Local/Android/Sdk/`).

### 1. Boot the emulator (if not already running)

```bash
adb devices -l                                   # already a device? skip the boot
emulator -list-avds                              # expect: Pixel_10
emulator -avd Pixel_10 -no-snapshot-save > /tmp/emulator.log 2>&1 &   # run in background
adb wait-for-device
# then poll until fully booted:
while [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do sleep 3; done
```

### 2. Start Metro — **kill any stale server on 8081 first** (this bit us before)

A leftover Metro from a prior session holds port 8081. In non-interactive/CI mode `expo start`
then **prompts "Use port 8082?" and silently skips the dev server** — the app never connects.
Always free the port first, and start Metro in **CI mode with a fixed port** so it never
prompts:

```bash
# Is 8081 taken? Find + kill the owning PID (it's a stale node/Metro — safe to restart):
powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess" | tr -d '\r'
# powershell.exe -NoProfile -Command "Stop-Process -Id <PID> -Force"

adb reverse tcp:8081 tcp:8081                     # route device:8081 → host Metro
cd <repo> && CI=1 EXPO_NO_TELEMETRY=1 bunx expo start --clear --port 8081 > /tmp/expo-start.log 2>&1 &
# wait, then confirm "Waiting on http://localhost:8081" in /tmp/expo-start.log
```

Use `--clear` only when metro/babel config changed (or to rule out a stale bundle); it forces
a full rebuild (~12s, "Bundler cache is empty").

### 3. Launch the project in Expo Go — **the `exp://` intent alone bounces to the launcher**

Firing only the deep link often drops back to the home screen, or Expo Go wedges on its blue
spinner. The reliable sequence: **foreground Expo Go's activity, then deep-link, and if it's
still stuck, force-stop and cold-launch.**

```bash
adb shell monkey -p host.exp.exponent -c android.intent.category.LAUNCHER 1   # bring Expo Go forward
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent

# Verify what's actually foreground (should be .experience.ExperienceActivity, NOT the launcher):
adb shell dumpsys activity activities | grep -i topResumedActivity | tr -d '\r' | head -1

# If wedged on the Expo Go spinner (screenshot stays ~25KB / no ReactNativeJS logs), cold-restart:
adb shell am force-stop host.exp.exponent
adb shell monkey -p host.exp.exponent -c android.intent.category.LAUNCHER 1 ; sleep 5
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent
```

Wait for the first bundle: watch `/tmp/expo-start.log` for `Android Bundled … (NNNN modules)`.
A real rendered screen is a **large** screencap (~60–100KB); a ~25KB one is still the spinner —
wait longer or cold-restart.

### 4. Screenshots — **write them INTO the repo, not `/tmp`**

The Read tool can't resolve Git Bash `/tmp` (it maps to a Windows temp path). Capture into a
temp dir **inside the repo**, Read them, then delete the dir before finishing:

```bash
mkdir -p .device-shots
adb exec-out screencap -p > .device-shots/01-today.png     # then Read the absolute repo path
# drive the UI with taps (screencap is 1080×2424; the Read image is downscaled —
#   multiply the displayed coords by the ratio the tool reports to get device pixels):
adb shell input tap <x> <y>
# ...capture each screen in the done-when flow...
rm -rf .device-shots                                        # clean up — never commit shots
```

### 5. Reading logs / triaging

```bash
adb logcat -d -t 500 | grep -iE "ReactNativeJS|Exception|error|fatal" | grep -viE "adbd|Nl80211|nativeloader"
```

- **Benign, ignore it:** `UIManagerHelper … ReactNoCrashSoftException: Cannot get UIManager
  because the context doesn't contain an active React instance` — fires when a *previous* Expo
  Go instance is torn down on reload/force-stop. It is **not** a red-box.
- A real JS error shows as a `ReactNativeJS` error line and/or an on-screen red-box — that
  fails the phase.

### 6. Leave it running

Leave Metro and the emulator up at the end (the user may want to poke at it) unless asked to
stop them. Note in the handoff's **Verified by** line exactly which screens/flow you exercised
and that iOS is unverified (no macOS host).

---

## 🤝 Phase handoffs — document every finished phase

The build proceeds in phases ([docs/build-plan.md](docs/build-plan.md)). **When a phase's
"done-when" bar is met, before ending the session, write a handoff file** so the next
session (which starts cold) has an accurate overview of what exists and what's next.

- **Location:** `docs/handoffs/phase-<N>-<slug>.md` (e.g. `docs/handoffs/phase-0-scaffold.md`).
- **One file per phase.** Never overwrite an earlier phase's handoff; each is a permanent
  record. Correct a phase's handoff only if that phase's facts later change.
- After writing it, add a one-line pointer to the index in
  [docs/handoffs/README.md](docs/handoffs/README.md) and update
  [docs/progress-tracker.md](docs/progress-tracker.md).

### Handoff template (fill every section — no vague points)

```markdown
# Phase <N> Handoff — <Title>

**Status:** ✅ complete · **Date:** <YYYY-MM-DD>
**Verified by:** <tsc / expo-doctor / lint / bundle / tests — with results>

## What this phase delivered
- Bullet list of concrete outcomes (files, features, config), each mapped to a build-plan task.

## Key files added/changed
- `path/to/file` — one line on its role.

## Decisions made (and why)
- Decision → rationale. Note any deviation from the docs and where the docs were updated.

## Gotchas / things the next agent must know
- Anything surprising: version quirks, APIs verified from source, workarounds, TODOs left.

## What is NOT done yet (deferred)
- Explicitly list anything a reader might assume is done but isn't.

## Next phase
- Phase <N+1>: <name> — the goal and its first concrete tasks (from build-plan.md).
```

### Starting a new session for the next phase

Before building phase N, **read the prior phase handoffs** (at minimum N-1, plus phase 0
for the foundation) so you inherit the context. State in your opening which phase you're
starting and which handoffs you read. Do not re-derive settled decisions — they're recorded.

---

## 📚 Project docs

The `docs/` folder is the source of truth for scope and design. Read the relevant doc
before working in its area, and update it when reality diverges:

- [docs/project-overview.md](docs/project-overview.md) — scope & non-goals
- [docs/architecture.md](docs/architecture.md) — structure, schema, domain rules
- [docs/ui-rules.md](docs/ui-rules.md) · [docs/ui-tokens.md](docs/ui-tokens.md) ·
  [docs/ui-registry.md](docs/ui-registry.md) — the design system
- [docs/code-standards.md](docs/code-standards.md) — conventions
- [docs/library-docs.md](docs/library-docs.md) — pinned versions & verified setup
- [docs/build-plan.md](docs/build-plan.md) · [docs/progress-tracker.md](docs/progress-tracker.md)
  — the plan & status
- [docs/handoffs/](docs/handoffs/) — per-phase handoff records (read the prior phase's
  before starting the next)

---

## TL;DR

1. This is **Expo SDK 57** — use v57 APIs.
2. For **any library API**, read **opensrc source** → then **Context7** → then official docs;
   never trust raw training recall.
3. Use **skills** (and `find-skills`) for setup tasks.
4. Keep `docs/` truthful.
5. **Finish a phase → write `docs/handoffs/phase-<N>-<slug>.md`.** Start a phase → read the
   prior handoffs first.
