/**
 * streak.computeStreak — docs/architecture.md §7.3. The correctness core of the app.
 * Test-first. Every edge case named in §7.3 is exercised here; a change to streak logic
 * must ship with its test (docs/code-standards.md §11).
 *
 * Reference weekdays (date-fns getDay):
 *   2026-07-20 Mon · 21 Tue · 22 Wed · 23 Thu · 24 Fri · 25 Sat · 26 Sun
 */
import { computeStreak } from "./streak";
import type { Cadence } from "./types";

const daily: Cadence = { type: "daily" };

describe("computeStreak — daily", () => {
  it("counts consecutive checked days ending today", () => {
    const days = ["2026-07-21", "2026-07-22", "2026-07-23"];
    expect(computeStreak(days, daily, "2026-07-23")).toBe(3);
  });

  it("today-grace: today unchecked does not break the streak (starts at yesterday)", () => {
    // Today (23) not checked, but 21+22 are → streak is 2, not 0.
    const days = ["2026-07-21", "2026-07-22"];
    expect(computeStreak(days, daily, "2026-07-23")).toBe(2);
  });

  it("today checked is included in the count", () => {
    const days = ["2026-07-22", "2026-07-23"];
    expect(computeStreak(days, daily, "2026-07-23")).toBe(2);
  });

  it("a missed yesterday breaks the streak (grace is today-only)", () => {
    // Today (23) unchecked → grace, walk starts at yesterday (22). 22 missing → streak 0,
    // even though 20+21 are checked. Grace does not extend past today.
    const days = ["2026-07-20", "2026-07-21"];
    expect(computeStreak(days, daily, "2026-07-23")).toBe(0);
  });

  it("a gap earlier stops the walk at the gap", () => {
    // 23,22 checked; 21 missing; 20,19 checked → streak counts only 23,22 = 2.
    const days = ["2026-07-19", "2026-07-20", "2026-07-22", "2026-07-23"];
    expect(computeStreak(days, daily, "2026-07-23")).toBe(2);
  });

  it("no check-ins at all is a streak of 0", () => {
    expect(computeStreak([], daily, "2026-07-23")).toBe(0);
  });

  it("future check-ins are ignored (only days up to today count)", () => {
    const days = ["2026-07-23", "2026-07-24", "2026-07-25"]; // 24,25 are future
    expect(computeStreak(days, daily, "2026-07-23")).toBe(1);
  });
});

describe("computeStreak — weekdays", () => {
  // Mon–Fri habit (1..5). Weekends are unscheduled and must NOT break the streak.
  const weekdays: Cadence = { type: "weekdays", weekdays: [1, 2, 3, 4, 5] };

  it("skips unscheduled weekend days without breaking the streak", () => {
    // today = Mon 27th. Checked: Fri 24, Thu 23. Sat 25 + Sun 26 are unscheduled.
    // Mon 27 (today) unchecked → grace. Walk: Fri24 ✓, Thu23 ✓, Wed22 not checked → stop.
    const days = ["2026-07-23", "2026-07-24"];
    expect(computeStreak(days, weekdays, "2026-07-27")).toBe(2);
  });

  it("an unchecked scheduled weekday breaks the streak", () => {
    // today = Fri 24 unchecked (grace). Thu 23 scheduled but unchecked → break → 0.
    const days = ["2026-07-20", "2026-07-21", "2026-07-22"];
    expect(computeStreak(days, weekdays, "2026-07-24")).toBe(0);
  });

  it("counts a run of scheduled weekdays across a weekend gap", () => {
    // today = Tue 28. Checked Mon27, Fri24, Thu23, Wed22, Tue21, Mon20.
    // Sat25/Sun26 skipped. All scheduled days from 28 back to 20 satisfied = 7 (28..20 wkdays).
    const days = [
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
      "2026-07-27",
      "2026-07-28",
    ];
    expect(computeStreak(days, weekdays, "2026-07-28")).toBe(7);
  });
});

describe("computeStreak — weekly_count (ISO weeks)", () => {
  // Target 3 per ISO week (Mon–Sun). Streak unit = weeks.
  const weekly: Cadence = { type: "weekly_count", weeklyTarget: 3 };

  it("counts consecutive ISO weeks that met the target", () => {
    // Week of 2026-07-20 (W30): 3 check-ins. Week of 2026-07-13 (W29): 3 check-ins.
    // today = 2026-07-23 (in W30, already met) → 2 weeks.
    const days = [
      "2026-07-13",
      "2026-07-15",
      "2026-07-17", // W29 ×3
      "2026-07-20",
      "2026-07-22",
      "2026-07-23", // W30 ×3
    ];
    expect(computeStreak(days, weekly, "2026-07-23")).toBe(2);
  });

  it("current-week grace: an unmet current week does not break the streak", () => {
    // W30 (current) has only 1 check-in (< 3) → grace, not counted, doesn't break.
    // W29 met (3) → streak = 1.
    const days = [
      "2026-07-13",
      "2026-07-15",
      "2026-07-17", // W29 ×3 (met)
      "2026-07-23", // W30 ×1 (unmet, current)
    ];
    expect(computeStreak(days, weekly, "2026-07-23")).toBe(1);
  });

  it("current week counts once it is met", () => {
    const days = [
      "2026-07-20",
      "2026-07-21",
      "2026-07-22", // W30 ×3 (met, current)
    ];
    expect(computeStreak(days, weekly, "2026-07-23")).toBe(1);
  });

  it("a past week below target breaks the streak", () => {
    // W30 current met (3). W29 only 2 (< 3) → break. Streak = 1.
    const days = [
      "2026-07-13",
      "2026-07-15", // W29 ×2 (unmet)
      "2026-07-20",
      "2026-07-21",
      "2026-07-22", // W30 ×3 (met)
    ];
    expect(computeStreak(days, weekly, "2026-07-23")).toBe(1);
  });

  it("ISO week boundary: Sunday belongs to the week that started Monday", () => {
    // 2026-07-19 is a Sunday → ISO week W29 (Mon 13 – Sun 19), NOT W30.
    // W29: 13,15,19 = 3 (met). today = Sun 19 (W29, current, met) → 1.
    const days = ["2026-07-13", "2026-07-15", "2026-07-19"];
    expect(computeStreak(days, weekly, "2026-07-19")).toBe(1);
  });

  it("no check-ins is a streak of 0 weeks", () => {
    expect(computeStreak([], weekly, "2026-07-23")).toBe(0);
  });
});
