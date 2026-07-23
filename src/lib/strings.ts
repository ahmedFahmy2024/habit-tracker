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
  /** Today screen copy (build-plan Phase 3 empty state + Phase 5 core loop). */
  today: {
    emptyTitle: "Add your first habit",
    emptyBody: "Habits you're doing today will show up here. Start by adding one.",
    emptyAction: "Add your first habit",
    /** Shown when habits exist but none are scheduled for today (docs/architecture.md §8). */
    noneScheduledTitle: "Nothing due today",
    noneScheduledBody: "No habits are scheduled for today. Enjoy the breather.",
    /** Header count, e.g. "2 of 5 done". */
    progressCount: (done: number, total: number) => `${done} of ${total} done`,
    /** Celebratory all-done state (docs/ui-rules.md §motion). */
    allDoneTitle: "All done!",
    allDoneBody: "Every habit for today is checked off. Nice work.",
    /** A11y label for the header progress ring. */
    a11yProgress: (done: number, total: number) =>
      `Today's progress: ${done} of ${total} habits done`,
    /** CheckControl a11y label prefix; the habit name is appended by the card. */
    a11yToggle: "Mark done",
    /** Streak label for a card, e.g. "🔥 5" (days) or "🔥 3 wk" (weeks). */
    streakDays: (n: number) => `🔥 ${n}`,
    streakWeeks: (n: number) => `🔥 ${n} wk`,
    a11yStreakDays: (n: number) =>
      `${n} day streak`,
    a11yStreakWeeks: (n: number) =>
      `${n} week streak`,
    /** A11y label for a card body (opens detail). */
    a11yOpenDetail: "Open habit details",
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
  /** Settings tab — preferences + data export/import + about (build-plan Phase 7). */
  settings: {
    title: "Settings",
    body: "Theme, week-start, and data options will live here.",

    // --- Appearance section ---
    appearanceSection: "Appearance",
    themeModeLabel: "Theme",
    themeModeDescription: "Match your device, or force light or dark.",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    accentLabel: "Accent color",
    accentDescription: "The highlight color used across the app.",

    // --- General section ---
    generalSection: "General",
    weekStartLabel: "Start week on",
    weekStartDescription: "Only changes how weekdays are displayed.",
    weekStartSunday: "Sunday",
    weekStartMonday: "Monday",

    // --- Data section ---
    dataSection: "Your data",
    dataDescription:
      "Export a backup of every habit and check-in, or restore from one.",
    exportLabel: "Export data",
    exportDescription: "Save a JSON backup you can keep or move to a new device.",
    importLabel: "Import data",
    importDescription: "Restore from a backup file. This replaces your current data.",
    /** Import is destructive (replace-all) — confirm first (docs/architecture.md §8). */
    importConfirmTitle: "Replace all data?",
    importConfirmBody:
      "Importing replaces every current habit and check-in with the contents of the backup file. This can't be undone.",
    importConfirmAction: "Choose file",
    /** Success / failure toasts (Alerts). */
    exportEmptyTitle: "Nothing to export",
    exportEmptyBody: "Add a habit first — there's no data to back up yet.",
    exportFailedTitle: "Export failed",
    exportFailedBody: "Couldn't create the backup file. Please try again.",
    sharingUnavailableTitle: "Sharing unavailable",
    sharingUnavailableBody:
      "This device can't open the share sheet. The backup was saved to the app's files.",
    importSuccessTitle: "Import complete",
    importSuccessBody: (habits: number, checkins: number) =>
      `Restored ${habits} ${habits === 1 ? "habit" : "habits"} and ${checkins} ${
        checkins === 1 ? "check-in" : "check-ins"
      }.`,
    importInvalidTitle: "Couldn't import this file",
    importInvalidBody:
      "This doesn't look like a Happit backup, or it was made by a newer version. No changes were made.",
    importFailedTitle: "Import failed",
    importFailedBody: "Something went wrong restoring the backup. No changes were made.",

    // --- About section ---
    aboutSection: "About",
    aboutAppName: "Happit",
    versionLabel: "Version",
    /** e.g. "1.0.0". */
    versionValue: (v: string) => v,

    // --- A11y ---
    a11yThemeMode: "Theme mode",
    a11yWeekStart: "Start week on",
    a11yExport: "Export your data",
    a11yImport: "Import data from a backup file",
  },
  /** Habit detail — streak hero, stats, heatmap, and manage actions (build-plan Phase 6). */
  habitDetail: {
    /** Shown while the live query loads / when the habit no longer exists (docs/architecture.md §8). */
    notFound: "This habit no longer exists.",

    // --- StreakBadge (hero) ---
    /** Unit caption under the hero number. */
    streakUnitDays: "day streak",
    streakUnitWeeks: "week streak",
    /** Quiet zero state — no scary "🔥 0". */
    noStreak: "No streak yet",
    /** "Best N" line beneath the hero (unit-aware). */
    bestDays: (n: number) => `Best: ${n} ${n === 1 ? "day" : "days"}`,
    bestWeeks: (n: number) => `Best: ${n} ${n === 1 ? "week" : "weeks"}`,
    a11yStreakDays: (current: number, best: number) =>
      `${current} day current streak, best ${best} days`,
    a11yStreakWeeks: (current: number, best: number) =>
      `${current} week current streak, best ${best} weeks`,

    // --- Stat row (Best · Completion · Total) ---
    statBest: "Best",
    statCompletion: "Completion",
    statTotal: "Check-ins",
    /** Completion percentage, e.g. "82%". */
    completionValue: (rate: number) => `${Math.round(rate * 100)}%`,
    /** Unit-suffixed best value for the stat tile, e.g. "12d" / "3w". */
    bestValue: (n: number, unit: "days" | "weeks") =>
      `${n}${unit === "weeks" ? "w" : "d"}`,

    // --- Heatmap ---
    heatmapTitle: "History",
    heatmapHint: "Tap a past day to add or remove a check-in.",
    /** A11y label for one cell, e.g. "Jul 12: done". */
    a11yHeatmapCell: (dayLabel: string, state: string) => `${dayLabel}: ${state}`,
    heatmapStateDone: "done",
    heatmapStateMissed: "missed",
    heatmapStateUnscheduled: "not scheduled",
    heatmapStateFuture: "upcoming",
    /** Sunday-first weekday initials for the heatmap row legend. */
    heatmapWeekdays: ["S", "M", "T", "W", "T", "F", "S"] as const,

    // --- Manage actions ---
    edit: "Edit",
    archive: "Archive",
    delete: "Delete",
    archiveConfirmTitle: "Archive habit?",
    archiveConfirmBody:
      "It's removed from your lists but its history is kept. You can't undo this in v1.",
    deleteConfirmTitle: "Delete habit?",
    deleteConfirmBody:
      "This permanently deletes the habit and all its check-in history. This can't be undone.",
    a11yEdit: "Edit habit",
    a11yArchive: "Archive habit",
    a11yDelete: "Delete habit",
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
  /** Local reminders (build-plan Phase 9) — notification copy + form/settings controls. */
  reminders: {
    // --- Notification content (what the OS shows) ---
    /** Android channel name shown in the OS notification settings. */
    channelName: "Reminders",
    /** Body of a per-habit reminder; the title is the habit's name. */
    body: "Still unchecked today — a quick tap keeps your streak.",
    /** One-shot test reminder (on-device verification only). */
    testTitle: "Happit reminder",
    testBody: "This is a test reminder. Your reminders are working.",

    // --- Habit form: reminder section ---
    formSectionLabel: "Reminder",
    formToggleLabel: "Remind me",
    formToggleDescription: "A local nudge on scheduled days while it's still unchecked.",
    formTimeLabel: "Time",
    /** Shown under the toggle when the OS permission is denied (build-plan Phase 9). */
    formPermissionDenied:
      "Notifications are turned off for Happit. Enable them in Settings to get reminders.",

    // --- Settings: Reminders section ---
    settingsSection: "Reminders",
    settingsDescription:
      "Per-habit reminders are set on each habit. These control the default time and the OS permission.",
    masterEnableLabel: "Allow reminders",
    masterEnableDescription: "Master switch for all habit reminders.",
    defaultTimeLabel: "Default time",
    defaultTimeDescription: "Pre-filled when you turn on a habit's reminder.",
    permissionLabel: "Notification permission",
    permissionGranted: "Allowed",
    permissionDenied: "Blocked — enable in system settings",
    permissionUndetermined: "Not requested yet",
    permissionUnavailable: "Unavailable in Expo Go",
    /** Shown when running in Expo Go, where expo-notifications is stubbed (SDK 53+). */
    unavailableBody:
      "Reminders need a development build — they don't run in Expo Go. Everything else works here.",
    permissionRequestAction: "Request permission",
    permissionOpenSettingsAction: "Open settings",
    /** Explains the OS-off state so there's no silent failure (build-plan Phase 9). */
    osOffBody:
      "Reminders are blocked at the system level. Open Settings to allow notifications for Happit.",
    testAction: "Send a test reminder",
    testScheduledTitle: "Test reminder scheduled",
    testScheduledBody: "It should arrive in about 10 seconds.",
    testFailedTitle: "Couldn't schedule the test",
    testFailedBody: "Notifications may be turned off for Happit.",

    // --- A11y ---
    a11yToggle: "Enable reminder for this habit",
    a11yTime: "Reminder time",
    a11yMasterEnable: "Allow reminders",
    a11yDefaultTime: "Default reminder time",
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
