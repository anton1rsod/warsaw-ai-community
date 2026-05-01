import { describe, expect, it } from "vitest";
import { currentWeek, parseWeek, weekFromDate, weekToRange } from "@/lib/week";

describe("week", () => {
  it("weekFromDate(2026-04-27 Monday) is 2026-W18", () => {
    expect(weekFromDate(new Date("2026-04-27T12:00:00Z"))).toBe("2026-W18");
  });

  it("weekFromDate(2026-05-03 Sunday) is still 2026-W18 (week boundary)", () => {
    expect(weekFromDate(new Date("2026-05-03T12:00:00Z"))).toBe("2026-W18");
  });

  it("weekFromDate(2026-05-04 Monday) is 2026-W19", () => {
    expect(weekFromDate(new Date("2026-05-04T12:00:00Z"))).toBe("2026-W19");
  });

  it("ISO week 1 boundary: 2027-01-04 (Monday) is 2027-W01", () => {
    expect(weekFromDate(new Date("2027-01-04T12:00:00Z"))).toBe("2027-W01");
  });

  it("ISO week 53 boundary: 2026-12-28 (Monday) is 2026-W53", () => {
    // 2026-01-01 is Thursday → 2026 has 53 ISO weeks.
    expect(weekFromDate(new Date("2026-12-28T12:00:00Z"))).toBe("2026-W53");
  });

  it("year-cross boundary: 2025-12-29 (Monday) is 2026-W01 (Jan 1 2026 is Thursday)", () => {
    // The Monday of W01 of 2026 falls on the previous calendar year (2025-12-29).
    // The Thursday-shift in weekFromDate carries the date forward to a Thursday
    // (2026-01-01) which sits in 2026, so the year prefix flips from 2025 → 2026.
    expect(weekFromDate(new Date("2025-12-29T12:00:00Z"))).toBe("2026-W01");
  });

  it("Sunday-as-day-7 ISO rule: 2026-01-04 (Sunday) is 2026-W01", () => {
    // dayNum branch: getUTCDay() returns 0 for Sunday; the `|| 7` fallback
    // converts to ISO day 7 (Sunday is the last day of the ISO week).
    expect(weekFromDate(new Date("2026-01-04T12:00:00Z"))).toBe("2026-W01");
  });

  it("currentWeek returns format YYYY-Www", () => {
    expect(currentWeek()).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("parseWeek returns year+week for valid input", () => {
    expect(parseWeek("2026-W18")).toEqual({ year: 2026, week: 18 });
    expect(parseWeek("2027-W01")).toEqual({ year: 2027, week: 1 });
  });

  it("parseWeek rejects invalid format", () => {
    expect(parseWeek("invalid")).toBeNull();
    expect(parseWeek("2026-W")).toBeNull();
    expect(parseWeek("2026-W1")).toBeNull(); // single-digit week not padded
    expect(parseWeek("26-W18")).toBeNull(); // 2-digit year not allowed
  });

  it("parseWeek rejects out-of-range week numbers", () => {
    expect(parseWeek("2026-W00")).toBeNull();
    expect(parseWeek("2026-W54")).toBeNull();
    expect(parseWeek("2026-W99")).toBeNull();
  });

  it("parseWeek + weekToRange roundtrip for 2026-W18", () => {
    const range = weekToRange("2026-W18");
    expect(range.start.toISOString().slice(0, 10)).toBe("2026-04-27");
    expect(range.end.toISOString().slice(0, 10)).toBe("2026-05-04"); // exclusive
  });

  it("weekToRange handles year-cross boundary 2026-W01 (Mon 2025-12-29)", () => {
    const range = weekToRange("2026-W01");
    expect(range.start.toISOString().slice(0, 10)).toBe("2025-12-29");
    expect(range.end.toISOString().slice(0, 10)).toBe("2026-01-05");
  });

  it("weekToRange handles W53 (2026-W53)", () => {
    const range = weekToRange("2026-W53");
    expect(range.start.toISOString().slice(0, 10)).toBe("2026-12-28");
    expect(range.end.toISOString().slice(0, 10)).toBe("2027-01-04");
  });

  it("weekToRange throws on invalid input", () => {
    expect(() => weekToRange("not-a-week")).toThrow(/invalid week/i);
    expect(() => weekToRange("2026-W99")).toThrow(/invalid week/i);
  });

  it("weekFromDate roundtrips through weekToRange for arbitrary dates", () => {
    // Property: any date d, weekToRange(weekFromDate(d)) brackets d.
    const samples = [
      "2026-01-01T00:00:00Z",
      "2026-04-27T12:00:00Z",
      "2026-12-31T23:59:00Z",
      "2027-01-04T00:00:00Z",
    ];
    for (const iso of samples) {
      const d = new Date(iso);
      const week = weekFromDate(d);
      const range = weekToRange(week);
      expect(d.getTime()).toBeGreaterThanOrEqual(range.start.getTime());
      expect(d.getTime()).toBeLessThan(range.end.getTime());
    }
  });
});
