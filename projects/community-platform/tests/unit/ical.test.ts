import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { EventSlugSchema } from "@/lib/events";
import type { Meeting } from "@/lib/meetings";
import {
  meetingToIcsEvent,
  eventToIcsEvent,
  generateIcs,
  type IcsEvent,
} from "@/lib/ical";
import type { CommunityDefaults } from "@/lib/community-defaults";

const DEFAULTS: CommunityDefaults = {
  timezone: "Europe/Warsaw",
  meetings: { defaultStartTime: "18:00", defaultDurationMinutes: 60, defaultLocation: "Telegram #voice" },
  events: { defaultStartTime: "18:00", defaultDurationMinutes: 120, defaultLocation: "TBD" },
};

describe("H47: ICS output is RFC 5545 valid", () => {
  it("generateIcs produces VCALENDAR/VEVENT structure", () => {
    const events: IcsEvent[] = [
      {
        uid: "meeting-2026-05-19",
        title: "Weekly sync",
        start: [2026, 5, 19, 18, 0],
        duration: { minutes: 60 },
        location: "Telegram #voice",
      },
    ];
    const ics = generateIcs(events);
    expect(ics).toMatch(/^BEGIN:VCALENDAR/m);
    expect(ics).toMatch(/END:VCALENDAR\s*$/m);
    expect(ics).toMatch(/BEGIN:VEVENT/m);
    expect(ics).toMatch(/UID:meeting-2026-05-19/);
    expect(ics).toMatch(/SUMMARY:Weekly sync/);
    expect(ics).toMatch(/LOCATION:Telegram #voice/);
  });

  it("generateIcs with empty events array produces minimal VCALENDAR", () => {
    const ics = generateIcs([]);
    expect(ics).toMatch(/^BEGIN:VCALENDAR/m);
    expect(ics).toMatch(/END:VCALENDAR\s*$/m);
    expect(ics).not.toMatch(/BEGIN:VEVENT/m);
  });

  it("generateIcs includes url and description when provided", () => {
    const events: IcsEvent[] = [
      {
        uid: "event-2026-06-15-hackathon",
        title: "Hackathon",
        start: [2026, 6, 15, 18, 0],
        duration: { minutes: 120 },
        description: "Annual AI hackathon",
        url: "https://example.com/hackathon",
      },
    ];
    const ics = generateIcs(events);
    expect(ics).toMatch(/DESCRIPTION:Annual AI hackathon/);
    expect(ics).toMatch(/URL:https:\/\/example\.com\/hackathon/);
  });
});

describe("H49: defaults fallback when frontmatter omits fields", () => {
  it("meetingToIcsEvent uses defaults for omitted start_time / duration / location", () => {
    const ics = meetingToIcsEvent(
      { date: "2026-05-19", slug: "2026-05-19", title: "Weekly sync", body: "", attendees: [] },
      DEFAULTS,
    );
    expect(ics.start).toEqual([2026, 5, 19, 18, 0]);
    expect(ics.duration).toEqual({ minutes: 60 });
    expect(ics.location).toBe("Telegram #voice");
    expect(ics.uid).toBe("meeting-2026-05-19");
  });

  it("eventToIcsEvent uses event-specific defaults", () => {
    const ics = eventToIcsEvent(
      {
        date: "2026-06-15",
        slug: EventSlugSchema.parse("2026-06-15-hackathon"),
        title: "Hackathon",
        body: "",
        status: "scheduled",
      },
      DEFAULTS,
    );
    expect(ics.start).toEqual([2026, 6, 15, 18, 0]);
    expect(ics.duration).toEqual({ minutes: 120 });
    expect(ics.uid).toBe("event-2026-06-15-hackathon");
  });

  it("uses frontmatter values when present (not defaults)", () => {
    const overriddenMeeting: Meeting & { startTime: string; durationMinutes: number; location: string } = {
      date: "2026-05-19",
      slug: "2026-05-19",
      title: "Weekly sync",
      body: "",
      attendees: [],
      startTime: "20:00",
      durationMinutes: 30,
      location: "Office",
    };
    const ics = meetingToIcsEvent(overriddenMeeting, DEFAULTS);
    expect(ics.start).toEqual([2026, 5, 19, 20, 0]);
    expect(ics.duration).toEqual({ minutes: 30 });
    expect(ics.location).toBe("Office");
  });
});

describe("branch coverage: parseHHMM and dateToIcsParts failure paths", () => {
  it("meetingToIcsEvent with malformed time string hits parseHHMM error path", () => {
    // Intentional invalid input to test error path — cast required for bad startTime value
    const badTimeMeeting = {
      date: "2026-05-19",
      slug: "2026-05-19",
      title: "Test",
      body: "",
      attendees: [],
      startTime: "invalid",
    } as unknown as Meeting & { startTime: string };
    expect(() => meetingToIcsEvent(badTimeMeeting, DEFAULTS)).toThrow(/ical: invalid HH:MM/);
  });

  it("dateToIcsParts throws on malformed date", () => {
    // Intentional invalid input to test error path — cast required for bad date value
    const badDateMeeting = {
      date: "not-a-date",
      slug: "not-a-date",
      title: "Test",
      body: "",
      attendees: [],
    } as unknown as Meeting;
    expect(() => meetingToIcsEvent(badDateMeeting, DEFAULTS)).toThrow(/ical:/);
  });
});

describe("generateIcs defensive error paths (mocked ics)", () => {
  // Spy on the real createEvents to simulate error conditions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let createEventsSpy: MockInstance<any>;

  beforeEach(async () => {
    const icsModule = await import("ics");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createEventsSpy = vi.spyOn(icsModule as any, "createEvents");
  });

  afterEach(() => {
    createEventsSpy.mockRestore();
  });

  it("throws when createEvents returns error with message", () => {
    createEventsSpy.mockReturnValueOnce({
      error: new Error("ics internal error"),
      value: undefined,
    });
    expect(() => generateIcs([{
      uid: "x",
      title: "X",
      start: [2026, 5, 19, 18, 0],
      duration: { minutes: 60 },
    }])).toThrow(/ical: createEvents failed/);
  });

  it("throws when createEvents returns error without message (uses String fallback)", () => {
    // Covers the `?? String(error)` branch — error object with no .message property
    createEventsSpy.mockReturnValueOnce({
      error: { toString: () => "raw error object" } as unknown as Error,
      value: undefined,
    });
    expect(() => generateIcs([{
      uid: "x",
      title: "X",
      start: [2026, 5, 19, 18, 0],
      duration: { minutes: 60 },
    }])).toThrow(/ical: createEvents failed/);
  });

  it("throws when createEvents returns non-string value", () => {
    createEventsSpy.mockReturnValueOnce({
      error: undefined,
      value: null,
    });
    expect(() => generateIcs([{
      uid: "x",
      title: "X",
      start: [2026, 5, 19, 18, 0],
      duration: { minutes: 60 },
    }])).toThrow(/ical: createEvents returned non-string value/);
  });
});
