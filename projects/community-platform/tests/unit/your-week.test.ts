import { describe, expect, it } from "vitest";
import { computeYourWeek, type YourWeekInput } from "@/lib/your-week";

const baseInput: YourWeekInput = {
  goingSlugs: [],
  events: [],
  kudosRecent: [],
  // Tue 2026-05-19 → ISO week = Mon 2026-05-18 .. Sun 2026-05-24 (UTC)
  now: new Date("2026-05-19T12:00:00Z"),
};

describe("computeYourWeek.nextRsvp — Option B / O9 wire-up", () => {
  it("returns the soonest upcoming event the member is going to", () => {
    const result = computeYourWeek({
      ...baseInput,
      goingSlugs: ["2026-05-25-far", "2026-05-22-close"],
      events: [
        { date: "2026-05-25", slug: "2026-05-25-far", title: "Far" },
        { date: "2026-05-22", slug: "2026-05-22-close", title: "Close" },
        { date: "2026-06-15", slug: "2026-06-15-not-going", title: "Skip" },
      ],
    });
    expect(result.nextRsvp).toEqual({
      slug: "2026-05-22-close",
      title: "Close",
      date: "2026-05-22",
    });
  });

  it("returns null when goingSlugs is empty (no RSVPs)", () => {
    expect(computeYourWeek(baseInput).nextRsvp).toBeNull();
  });

  it("returns null when all going events are in the past", () => {
    const result = computeYourWeek({
      ...baseInput,
      goingSlugs: ["2026-04-01-old"],
      events: [{ date: "2026-04-01", slug: "2026-04-01-old", title: "Old" }],
    });
    expect(result.nextRsvp).toBeNull();
  });

  it("includes events on today's date (>= today, not strictly >)", () => {
    const result = computeYourWeek({
      ...baseInput,
      goingSlugs: ["2026-05-19-today"],
      events: [{ date: "2026-05-19", slug: "2026-05-19-today", title: "Today" }],
    });
    expect(result.nextRsvp?.slug).toBe("2026-05-19-today");
  });

  it("ignores events the member is not going to even if upcoming", () => {
    const result = computeYourWeek({
      ...baseInput,
      goingSlugs: ["2026-05-22-going"],
      events: [{ date: "2026-05-20", slug: "2026-05-20-other", title: "Other" }],
    });
    expect(result.nextRsvp).toBeNull();
  });
});

describe("computeYourWeek.kudosWeekCount — Option B / O9 wire-up", () => {
  it("counts kudos with given_at inside current ISO week (Mon-Sun UTC)", () => {
    const result = computeYourWeek({
      ...baseInput,
      // ISO week = Mon 2026-05-18 .. Sun 2026-05-24
      kudosRecent: [
        { given_at: "2026-05-18T08:00:00Z" }, // Mon — in
        { given_at: "2026-05-24T23:59:00Z" }, // Sun — in
        { given_at: "2026-05-17T23:59:00Z" }, // prior Sun — out
        { given_at: "2026-05-25T00:00:00Z" }, // next Mon — out
      ],
    });
    expect(result.kudosWeekCount).toBe(2);
  });

  it("returns 0 when kudosRecent is empty (no kudos received)", () => {
    expect(computeYourWeek(baseInput).kudosWeekCount).toBe(0);
  });

  it("returns 0 when no kudos fall in the current week", () => {
    const result = computeYourWeek({
      ...baseInput,
      kudosRecent: [
        { given_at: "2026-04-01T00:00:00Z" },
        { given_at: "2026-06-01T00:00:00Z" },
      ],
    });
    expect(result.kudosWeekCount).toBe(0);
  });

  it("handles Sunday boundary correctly (UTC dayOfWeek=0 → week end)", () => {
    const result = computeYourWeek({
      ...baseInput,
      // Sun 2026-05-24 → still in ISO week starting Mon 2026-05-18
      now: new Date("2026-05-24T22:00:00Z"),
      kudosRecent: [
        { given_at: "2026-05-18T00:00:00Z" }, // Mon of same week — in
        { given_at: "2026-05-24T20:00:00Z" }, // Sun of same week — in
        { given_at: "2026-05-25T00:00:00Z" }, // next Mon — out
      ],
    });
    expect(result.kudosWeekCount).toBe(2);
  });
});
