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

---

## TL;DR

1. This is **Expo SDK 57** — use v57 APIs.
2. For **any library API**, read **opensrc source** → then **Context7** → then official docs;
   never trust raw training recall.
3. Use **skills** (and `find-skills`) for setup tasks.
4. Keep `docs/` truthful.
