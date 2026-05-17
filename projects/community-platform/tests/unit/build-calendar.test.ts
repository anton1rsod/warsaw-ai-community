import { describe, expect, it } from "vitest";
import { computeCalendarEvents } from "@/scripts/build-calendar";
import type { CommunityDefaults } from "@/lib/community-defaults";
import type { Meeting } from "@/lib/meetings";
import { EventSchema, type Event } from "@/lib/events";

const DEFAULTS: CommunityDefaults = {
  timezone: "Europe/Warsaw",
  meetings: { defaultStartTime: "18:00", defaultDurationMinutes: 60, defaultLocation: "Telegram" },
  events: { defaultStartTime: "18:00", defaultDurationMinutes: 120, defaultLocation: "TBD" },
};

function makeEvent(overrides: {
  slug: string;
  date: string;
  title: string;
  status?: "scheduled" | "cancelled" | "completed";
  body?: string;
  startTime?: string;
  durationMinutes?: number;
  location?: string;
  host?: string;
  url?: string;
}): Event {
  return EventSchema.parse({ body: "", status: "scheduled", ...overrides });
}

describe("build-calendar: aggregate selection", () => {
  it("includes upcoming + recent past (last 30 days)", () => {
    const now = new Date("2026-05-19T12:00:00Z");
    const events = computeCalendarEvents(
      [
        { date: "2026-05-19", slug: "2026-05-19", title: "This-Week Mtg", body: "", attendees: [] },
        { date: "2026-05-05", slug: "2026-05-05", title: "Recent Mtg", body: "", attendees: [] },
        { date: "2026-01-01", slug: "2026-01-01", title: "Old Mtg", body: "", attendees: [] },
      ],
      [
        makeEvent({ date: "2026-06-15", slug: "2026-06-15-future", title: "Future event", status: "scheduled" }),
        makeEvent({ date: "2026-04-01", slug: "2026-04-01-past", title: "Past event >30d", status: "completed" }),
      ],
      now,
      DEFAULTS,
    );
    const uids = events.map((e) => e.uid);
    expect(uids).toContain("meeting-2026-05-19");
    expect(uids).toContain("meeting-2026-05-05");
    expect(uids).not.toContain("meeting-2026-01-01");
    expect(uids).toContain("event-2026-06-15-future");
    expect(uids).not.toContain("event-2026-04-01-past");
  });

  it("excludes cancelled events", () => {
    const events = computeCalendarEvents(
      [],
      [makeEvent({ date: "2026-06-01", slug: "2026-06-01-cancel", title: "X", status: "cancelled" })],
      new Date("2026-05-19T12:00:00Z"),
      DEFAULTS,
    );
    expect(events).toEqual([]);
  });

  it("includes meeting exactly on the 30-day cutoff boundary (inclusive)", () => {
    const now = new Date("2026-05-19T12:00:00Z");
    // 30 days before 2026-05-19 is 2026-04-19
    const cutoffDate = "2026-04-19";
    const events = computeCalendarEvents(
      [{ date: cutoffDate, slug: cutoffDate, title: "Boundary Mtg", body: "", attendees: [] }],
      [],
      now,
      DEFAULTS,
    );
    const uids = events.map((e) => e.uid);
    expect(uids).toContain(`meeting-${cutoffDate}`);
  });

  it("excludes meeting one day before the 30-day cutoff", () => {
    const now = new Date("2026-05-19T12:00:00Z");
    // One day before the cutoff: 2026-04-18
    const events = computeCalendarEvents(
      [{ date: "2026-04-18", slug: "2026-04-18", title: "Just-before Mtg", body: "", attendees: [] }],
      [],
      now,
      DEFAULTS,
    );
    expect(events).toEqual([]);
  });

  it("returns empty array for empty inputs", () => {
    const events = computeCalendarEvents(
      [],
      [],
      new Date("2026-05-19T12:00:00Z"),
      DEFAULTS,
    );
    expect(events).toEqual([]);
  });

  it("Meeting interface fields are preserved (attendees array)", () => {
    const meeting: Meeting = {
      slug: "2026-05-19",
      date: "2026-05-19",
      title: "Test Mtg",
      body: "## Attendees\n- Alice\n- Bob",
      attendees: ["Alice", "Bob"],
    };
    const events = computeCalendarEvents(
      [meeting],
      [],
      new Date("2026-05-19T12:00:00Z"),
      DEFAULTS,
    );
    expect(events).toHaveLength(1);
    expect(events[0]?.uid).toBe("meeting-2026-05-19");
  });

  it("includes events with scheduled and completed status within 30 days", () => {
    const now = new Date("2026-05-19T12:00:00Z");
    const events = computeCalendarEvents(
      [],
      [
        makeEvent({ date: "2026-05-20", slug: "2026-05-20-upcoming", title: "Upcoming", status: "scheduled" }),
        makeEvent({ date: "2026-05-10", slug: "2026-05-10-recent", title: "Recent completed", status: "completed" }),
      ],
      now,
      DEFAULTS,
    );
    const uids = events.map((e) => e.uid);
    expect(uids).toContain("event-2026-05-20-upcoming");
    expect(uids).toContain("event-2026-05-10-recent");
  });
});
