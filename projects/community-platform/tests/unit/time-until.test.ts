import { describe, it, expect } from "vitest";
import { formatTimeUntil } from "@/lib/time-until";

describe("formatTimeUntil", () => {
  it("formats minutes-only for events <1h away", () => {
    expect(
      formatTimeUntil("2026-05-21", "19:00", new Date(2026, 4, 21, 18, 30)),
    ).toBe("in 30m");
  });

  it("formats hours+minutes for same-day events", () => {
    expect(
      formatTimeUntil("2026-05-21", "19:00", new Date(2026, 4, 21, 12, 30)),
    ).toBe("in 6h 30m");
  });

  it("formats days+hours for multi-day-away events", () => {
    expect(
      formatTimeUntil("2026-05-25", "19:00", new Date(2026, 4, 21, 18, 0)),
    ).toMatch(/^in \d+d/);
  });

  it("returns 'now' for past events", () => {
    expect(
      formatTimeUntil("2026-05-20", "19:00", new Date(2026, 4, 21)),
    ).toBe("now");
  });

  it("defaults missing startTime to 00:00", () => {
    expect(
      formatTimeUntil("2026-05-22", undefined, new Date(2026, 4, 21, 12, 0)),
    ).toMatch(/^in/);
  });
});
