// tests/unit/iso-week.test.ts
import { describe, it, expect } from "vitest";
import { parseIsoWeek, isoWeekMonday, trailingStreak } from "../../lib/sources/iso-week.js";

describe("iso-week", () => {
  it("parseIsoWeek extracts year+week, throws on garbage", () => {
    expect(parseIsoWeek("2026-W18")).toEqual({ year: 2026, week: 18 });
    expect(() => parseIsoWeek("2026-18")).toThrow();
  });

  it("isoWeekMonday returns the Monday (UTC) of the ISO week", () => {
    // 2026-W01 Monday is 2025-12-29 (ISO rule: week containing first Thursday).
    expect(isoWeekMonday(2026, 1).toISOString().slice(0, 10)).toBe("2025-12-29");
    expect(isoWeekMonday(2026, 18).toISOString().slice(0, 10)).toBe("2026-04-27");
  });

  it("trailingStreak counts consecutive weeks ending at the latest", () => {
    expect(trailingStreak(["2026-W16", "2026-W17", "2026-W18"])).toBe(3);
    expect(trailingStreak(["2026-W16", "2026-W18"])).toBe(1); // gap breaks the trailing run
    expect(trailingStreak([])).toBe(0);
  });

  it("trailingStreak spans a year boundary correctly", () => {
    // 2026-W53 (Mon 2026-12-28) → 2027-W01 (Mon 2027-01-04) are 7 days apart.
    expect(trailingStreak(["2026-W53", "2027-W01"])).toBe(2);
  });
});
