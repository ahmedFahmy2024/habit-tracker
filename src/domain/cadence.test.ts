/**
 * cadence.isScheduledOn — docs/architecture.md §7.2.
 * Test-first: these encode the scheduling rules before the implementation exists.
 */
import { isScheduledOn } from "./cadence";
import type { Cadence } from "./types";

// Reference days (verified weekdays via date-fns getDay):
//   2026-07-19 = Sunday (0)
//   2026-07-20 = Monday (1)
//   2026-07-22 = Wednesday (3)
//   2026-07-23 = Thursday (4)
//   2026-07-25 = Saturday (6)

describe("isScheduledOn — daily", () => {
  const daily: Cadence = { type: "daily" };

  it("is always scheduled, any day of the week", () => {
    expect(isScheduledOn(daily, "2026-07-19")).toBe(true); // Sun
    expect(isScheduledOn(daily, "2026-07-22")).toBe(true); // Wed
    expect(isScheduledOn(daily, "2026-07-25")).toBe(true); // Sat
  });
});

describe("isScheduledOn — weekdays", () => {
  // Mon(1), Wed(3), Fri(5)
  const mwf: Cadence = { type: "weekdays", weekdays: [1, 3, 5] };

  it("is scheduled on a listed weekday", () => {
    expect(isScheduledOn(mwf, "2026-07-20")).toBe(true); // Monday
    expect(isScheduledOn(mwf, "2026-07-22")).toBe(true); // Wednesday
  });

  it("is not scheduled on an unlisted weekday", () => {
    expect(isScheduledOn(mwf, "2026-07-19")).toBe(false); // Sunday
    expect(isScheduledOn(mwf, "2026-07-21")).toBe(false); // Tuesday
    expect(isScheduledOn(mwf, "2026-07-23")).toBe(false); // Thursday
    expect(isScheduledOn(mwf, "2026-07-25")).toBe(false); // Saturday
  });

  it("uses 0=Sunday numbering (a Sunday-only habit matches only Sundays)", () => {
    const sun: Cadence = { type: "weekdays", weekdays: [0] };
    expect(isScheduledOn(sun, "2026-07-19")).toBe(true); // Sunday
    expect(isScheduledOn(sun, "2026-07-20")).toBe(false); // Monday
  });

  it("uses 6=Saturday numbering (a Saturday-only habit matches only Saturdays)", () => {
    const sat: Cadence = { type: "weekdays", weekdays: [6] };
    expect(isScheduledOn(sat, "2026-07-25")).toBe(true); // Saturday
    expect(isScheduledOn(sat, "2026-07-24")).toBe(false); // Friday
  });

  it("an empty weekday list is never scheduled", () => {
    const none: Cadence = { type: "weekdays", weekdays: [] };
    expect(isScheduledOn(none, "2026-07-20")).toBe(false);
  });
});

describe("isScheduledOn — weekly_count", () => {
  // Every day is a valid opportunity; the goal (N/week) lives in the streak rules, not here.
  const weekly: Cadence = { type: "weekly_count", weeklyTarget: 3 };

  it("treats every day as an opportunity (always true)", () => {
    expect(isScheduledOn(weekly, "2026-07-19")).toBe(true); // Sun
    expect(isScheduledOn(weekly, "2026-07-20")).toBe(true); // Mon
    expect(isScheduledOn(weekly, "2026-07-25")).toBe(true); // Sat
  });
});
