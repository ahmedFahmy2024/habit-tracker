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
  /** Migration gate — the loading/error screens shown at boot (docs/architecture.md §8). */
  migration: {
    loadingTitle: "Setting things up",
    loadingBody: "Preparing your habits…",
    errorTitle: "Couldn't start the database",
    errorBody:
      "Something went wrong preparing your data. Restart the app to try again.",
  },
} as const;
