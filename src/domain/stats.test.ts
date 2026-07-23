/**
 * stats — completionRate / bestStreak / heatmap buckets (docs/architecture.md §7.3, §9).
 * Test-first. Best streak uses the same rules as computeStreak but over all history.
 */
import { bestStreak, completionRate, heatmapBuckets } from "./stats";
import type { Cadence } from "./types";

const daily: Cadence = { type: "daily" };

describe("completionRate", () => {
  it("is satisfied-scheduled / total-scheduled over the range", () => {
    // Range 2026-07-20..2026-07-24 (Mon–Fri), daily → 5 scheduled days. 3 checked → 0.6.
    const days = ["2026-07-20", "2026-07-22", "2026-07-24"];
    expect(completionRate(days, daily, "2026-07-20", "2026-07-24")).toBeCloseTo(
      0.6,
    );
  });

  it("only counts scheduled days in the denominator (weekdays cadence)", () => {
    // Mon–Fri habit over a full week 20..26. Scheduled: 20,21,22,23,24 (5). Weekend excluded.
    const weekdays: Cadence = { type: "weekdays", weekdays: [1, 2, 3, 4, 5] };
    // Checked all 5 weekdays (+ a stray weekend check-in that must not affect the rate).
    const days = [
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
      "2026-07-25", // Saturday — unscheduled, ignored
    ];
    expect(completionRate(days, weekdays, "2026-07-20", "2026-07-26")).toBe(1);
  });

  it("is 0 when nothing is checked", () => {
    expect(completionRate([], daily, "2026-07-20", "2026-07-24")).toBe(0);
  });

  it("is 0 (not NaN) when there are no scheduled days in the range", () => {
    const none: Cadence = { type: "weekdays", weekdays: [] };
    expect(completionRate([], none, "2026-07-20", "2026-07-24")).toBe(0);
  });

  it("ignores check-ins outside the range", () => {
    const days = ["2026-07-10", "2026-07-22", "2026-07-30"];
    // Only 22 is in-range; 5 scheduled days → 1/5 = 0.2.
    expect(completionRate(days, daily, "2026-07-20", "2026-07-24")).toBeCloseTo(
      0.2,
    );
  });
});

describe("bestStreak — daily", () => {
  it("finds the longest historical run, not just the current one", () => {
    // Run A: 01,02,03,04 (4). Gap. Run B (current-ish): 10,11 (2). Best = 4.
    const days = [
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
      "2026-07-04",
      "2026-07-10",
      "2026-07-11",
    ];
    expect(bestStreak(days, daily, "2026-07-11")).toBe(4);
  });

  it("is 0 for no check-ins", () => {
    expect(bestStreak([], daily, "2026-07-23")).toBe(0);
  });

  it("current streak counts toward best (single run)", () => {
    const days = ["2026-07-21", "2026-07-22", "2026-07-23"];
    expect(bestStreak(days, daily, "2026-07-23")).toBe(3);
  });
});

describe("bestStreak — weekdays skips weekends", () => {
  const weekdays: Cadence = { type: "weekdays", weekdays: [1, 2, 3, 4, 5] };
  it("treats a weekend gap as continuous", () => {
    // Fri 24, Mon 27 checked (Sat/Sun unscheduled between) → best run of 2 scheduled days.
    const days = ["2026-07-24", "2026-07-27"];
    expect(bestStreak(days, weekdays, "2026-07-27")).toBe(2);
  });
});

describe("heatmapBuckets", () => {
  const weekdays: Cadence = { type: "weekdays", weekdays: [1, 2, 3, 4, 5] };

  it("labels each day in range as done / missed / unscheduled", () => {
    // 20 Mon done, 21 Tue missed, 25 Sat unscheduled.
    const days = ["2026-07-20"];
    const buckets = heatmapBuckets(days, weekdays, "2026-07-20", "2026-07-25");
    const byDay = Object.fromEntries(buckets.map((b) => [b.day, b.state]));
    expect(byDay["2026-07-20"]).toBe("done");
    expect(byDay["2026-07-21"]).toBe("missed");
    expect(byDay["2026-07-25"]).toBe("unscheduled");
  });

  it("returns one bucket per day in the inclusive range, in order", () => {
    const buckets = heatmapBuckets([], daily, "2026-07-20", "2026-07-23");
    expect(buckets.map((b) => b.day)).toEqual([
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
    ]);
  });

  it("marks a checked unscheduled day as done (backfilled extra credit still shows)", () => {
    // A check-in on an unscheduled Saturday should read as done, not unscheduled.
    const buckets = heatmapBuckets(
      ["2026-07-25"],
      weekdays,
      "2026-07-25",
      "2026-07-25",
    );
    expect(buckets[0]!.state).toBe("done");
  });
});
