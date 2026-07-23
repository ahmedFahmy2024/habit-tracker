/**
 * Central user-facing strings — docs/code-standards.md §10.
 *
 * Every user-visible string lives here (even though v1 is English-only) so a future locale
 * is a data change, not a hunt. Components import `strings.*`, never inline copy.
 *
 * Organized by area. Phase 1 seeds only the design-system-level strings (a11y labels,
 * common actions, generic empty state); feature phases add their own sections.
 */
export const strings = {
  common: {
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    done: "Done",
    retry: "Try again",
    loading: "Loading…",
  },
  a11y: {
    /** Generic loading-spinner label for buttons in the loading state. */
    loading: "Loading",
    /** Fallback empty-state action label. */
    emptyAction: "Get started",
  },
  empty: {
    genericTitle: "Nothing here yet",
    genericBody: "When there's something to show, it'll appear here.",
  },
  /** Tab screen copy (build-plan Phase 3 — navigation shell). */
  today: {
    emptyTitle: "Add your first habit",
    emptyBody: "Habits you're doing today will show up here. Start by adding one.",
    emptyAction: "Add your first habit",
  },
  habits: {
    emptyTitle: "No habits yet",
    emptyBody: "Create a habit to start building your streaks.",
    newAction: "New habit",
    fabLabel: "Add habit",
    /** Swipe-to-archive action + confirm (docs/library-docs.md §10). */
    archiveAction: "Archive",
    archiveConfirmTitle: "Archive habit?",
    archiveConfirmBody:
      "It's removed from your lists but its history is kept. You can't undo this in v1.",
    dragHint: "Reorder",
    /** Accessibility labels for the manage-list controls. */
    a11yDragHandle: "Drag to reorder",
    a11yEditRow: "Edit habit",
  },
  settings: {
    title: "Settings",
    body: "Theme, week-start, and data options will live here.",
  },
  /** Habit detail + add/edit screens (skeletons this phase). */
  habitDetail: {
    title: "Habit detail",
    body: "History, streaks, and the heatmap will live here.",
  },
  /** Add-habit modal (build-plan Phase 4). */
  habitNew: {
    title: "New habit",
    submit: "Create habit",
  },
  /** Edit-habit modal — reuses the same form (build-plan Phase 4). */
  habitEdit: {
    title: "Edit habit",
    submit: "Save changes",
    notFound: "This habit no longer exists.",
  },
  /** Shared add/edit habit form — field labels, sections, validation. */
  habitForm: {
    nameLabel: "Name",
    namePlaceholder: "e.g. Drink water",
    colorLabel: "Color",
    iconLabel: "Icon",
    cadenceLabel: "Repeat",
    errorNameRequired: "Give your habit a name.",
    errorWeekdaysRequired: "Pick at least one day.",
    errorWeeklyTarget: "Pick a target of at least 1.",
    a11yColorSwatch: "Color",
    a11yIconCell: "Icon",
  },
  /** CadencePicker copy — segment labels, weekday abbreviations, stepper (docs/ui-registry.md). */
  cadence: {
    daily: "Daily",
    weekdays: "Weekdays",
    weeklyCount: "Times / week",
    /** Sunday-first display order; index == Weekday number (0=Sun..6=Sat). */
    weekdayShort: ["S", "M", "T", "W", "T", "F", "S"] as const,
    weekdayLong: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ] as const,
    perWeekLabel: "times per week",
    stepperDecrement: "Fewer times per week",
    stepperIncrement: "More times per week",
    /** Compact summaries for the manage list (see lib cadenceSummary). */
    summaryDaily: "Every day",
    summaryWeeklyOne: "Once a week",
    summaryWeeklyN: (n: number) => `${n}× a week`,
    summaryEveryday: "Every day",
    summaryWeekends: "Weekends",
  },
  /** Migration gate — the loading/error screens shown at boot (docs/architecture.md §8). */
  migration: {
    loadingTitle: "Setting things up",
    loadingBody: "Preparing your habits…",
    errorTitle: "Couldn't start the database",
    errorBody:
      "Something went wrong preparing your data. Restart the app to try again.",
  },
} as const;
