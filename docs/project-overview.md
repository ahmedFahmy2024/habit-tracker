# Project Overview — Happit

> The single source of truth for **what** we are building and **why**. Every other doc
> derives its scope from this one. If a feature is not described here, it is out of scope
> for v1.

---

## 1. One-line definition

**Happit** is an offline-first, single-user habit tracker for Android and iOS, built with
Expo, whose design language is **Material 3 Expressive**.

## 2. Who it is for

- **Exactly one user: me.** There are no accounts, no login, no multi-user support, no
  sharing. This is a deliberate constraint, not a missing feature.
- Because there is one user, there is **no server, no auth, and no network dependency**.
  The app is fully functional in airplane mode, forever.

## 3. Product goals (ranked)

1. **Frictionless daily check-in.** Marking today's habits done must take < 5 seconds from
   cold launch. This is the primary loop and beats every other consideration.
2. **A genuinely Material 3 Expressive interface.** Not "M3-ish". Springy motion, shape
   morphing on interaction, tonal color, large emphasized typography. See
   [ui-rules.md](./ui-rules.md).
3. **Trustworthy streaks and history.** The numbers must always be correct, including
   across timezone changes, DST, and days the app was never opened.
4. **Zero data loss.** Local data survives app updates via migrations. See
   [architecture.md](./architecture.md).
5. **Stay-on-track surfaces.** The habit stays present outside the app — a **local
   reminder** nudges the user when a scheduled habit is still unchecked, and a
   **home-screen widget** shows today's progress and streaks at a glance. These reinforce
   the daily loop; they never replace it or add a network dependency.

## 3a. Signature features (the five)

The features that define what Happit *feels* like, and where each is specified/built:

| Feature | What it is | Scope | Where |
| --- | --- | --- | --- |
| **Streaks** | Consecutive-scheduled-day count per habit, ending today/yesterday. Always correct across tz/DST/unopened days. | v1 core | [architecture.md](./architecture.md) §7; build-plan Phase 2/5/6 |
| **Hit graph (heatmap)** | Calendar heatmap of check-ins on the habit-detail screen; taps backfill past days (never future). | v1 core | build-plan Phase 6; `Heatmap` in [ui-registry.md](./ui-registry.md) |
| **Haptics** | Semantic haptic tokens (`check`, `success`, `select`…) fired on every meaningful interaction, respecting the OS reduce-motion/haptics setting. | v1 core | `src/lib/haptics.ts`; build-plan Phase 1; [ui-tokens.md](./ui-tokens.md) §7 |
| **Local notifications / reminders** | Per-habit local reminder at a chosen time on scheduled days; no push server, no account. Nudges only while unchecked. | **v1** (Phase 9) | build-plan Phase 9; `expo-notifications` in [library-docs.md](./library-docs.md) |
| **Live home-screen widget** | Native widget (iOS WidgetKit / Android Glance) showing today's completion ring + a top streak, refreshed from shared local data. | **v1** (Phase 10) | build-plan Phase 10; [library-docs.md](./library-docs.md) |

## 4. Non-goals (explicitly out of scope for v1)

These are listed so we never accidentally build them:

- ❌ Accounts, login, cloud sync, multi-device. (Local-only by decision.)
- ❌ Social features, sharing, leaderboards.
- ❌ **Push** notifications (server-sent). We ship **local** reminders only (§3a, Phase 9) —
  scheduled on-device, no push token, no server, works in airplane mode.
- ❌ Web target. Android + iOS only. Code may run on web but it is not a supported surface.
- ❌ Habit "templates" marketplace, AI suggestions, coaching.
- ❌ Watch apps, home-screen quick actions. *(The home-screen **widget** is now in scope —
  §3a, Phase 10. Watch/quick-actions remain out.)*

> Local notifications and the home-screen widget were previously deferred to v2/v3. They are
> now **v1 scope** (Phases 9 & 10). Both are strictly local — they add no accounts, no
> network, and no push server, so the offline-first, single-user constraint still holds.

## 5. Core concepts (the domain vocabulary)

Use these exact words everywhere — code, UI copy, and docs. See
[architecture.md](./architecture.md) for how they map to tables.

| Term | Definition |
| --- | --- |
| **Habit** | A recurring thing the user wants to do (e.g. "Drink water"). Has a name, color, icon, cadence, and an archived flag. |
| **Cadence** | *How often* a habit is expected. v1 supports: **Daily**, **Specific weekdays** (e.g. Mon/Wed/Fri), and **N times per week**. |
| **Check-in** | A record that a habit was completed on a specific calendar day. At most one check-in per habit per day. |
| **Streak** | The count of consecutive *scheduled* days (per the cadence) the habit was checked in, ending today or yesterday. See [architecture.md](./architecture.md) §7 Streak rules. |
| **Today** | The user's local calendar day, determined by device timezone at read time. |
| **Archive** | Soft-hiding a habit. Archived habits keep their history but disappear from the daily view. Never hard-deleted unless the user explicitly deletes. |

## 6. The screens (v1 surface area)

Four screens, mapped to navigation in [architecture.md](./architecture.md) §6.

1. **Today** — the home screen. Lists habits scheduled for today with a large check
   control each. Shows today's completion progress. This is the app's front door.
2. **Habits** — manage the full list: add, edit, reorder, archive.
3. **Habit detail** — one habit's history: calendar heatmap, current & best streak,
   completion rate. Reached by tapping a habit.
4. **Settings** — theme (light/dark/system), accent color, week-start day, **reminder
   defaults & per-habit reminder toggles**, data export/import, about.

Beyond the four screens, two features live outside the app's own navigation:

5. **Reminders** (Phase 9) — configured on the add/edit-habit form and in Settings; surfaced
   as OS local notifications on scheduled days.
6. **Home-screen widget** (Phase 10) — a native widget target (not a JS screen) reading
   shared local data to show today's ring + top streak.

## 7. Roadmap beyond v1 (context only — do not build)

- v2: Optional encrypted backup export to a file the user controls.
- v2: Rich widget variants (multiple sizes, lock-screen / Live Activity).
- v3: Watch app; home-screen quick actions.

> Local reminders and the home-screen widget moved **into v1** (§3a, build-plan Phases 9 & 10)
> and are no longer roadmap items.

## 8. How the docs fit together

| Doc | Answers |
| --- | --- |
| [project-overview.md](./project-overview.md) | What & why (this file) |
| [architecture.md](./architecture.md) | How it's structured: stack, folders, data model, navigation |
| [ui-rules.md](./ui-rules.md) | The Material 3 Expressive design principles & interaction rules |
| [ui-tokens.md](./ui-tokens.md) | The concrete design tokens (color, type, shape, motion, spacing) |
| [ui-registry.md](./ui-registry.md) | The component inventory: every reusable UI component and its API |
| [code-standards.md](./code-standards.md) | Conventions: naming, file layout, TypeScript, lint rules |
| [library-docs.md](./library-docs.md) | Pinned versions & the exact setup for each dependency |
| [build-plan.md](./build-plan.md) | The ordered, phased plan to build it |
| [progress-tracker.md](./progress-tracker.md) | Living checklist of what's done |
