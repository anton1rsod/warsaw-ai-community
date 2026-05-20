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
        tz: "Europe/Warsaw",
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
        tz: "Europe/Warsaw",
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

describe("v0.4.6: ICS DTSTART output is TZ-independent (build-host-agnostic)", () => {
  // Root cause of the bug closed by these tests: lib/ical.ts dateToIcsParts
  // returned naive [y, mo, d, hh, mm] tuples which the `ics` package
  // interpreted as the build host's local timezone. Vercel builds in UTC,
  // dev machines build in CEST/CET; same source → divergent DTSTART output.
  // Fix: IcsEvent gains an explicit `tz` field; generateIcs converts
  // wall-clock + tz → UTC tuple via Intl.DateTimeFormat (TZ-database-aware,
  // DST-correct) and emits with `startInputType: 'utc'`.

  function withTz<T>(tz: string, fn: () => T): T {
    const original = process.env.TZ;
    process.env.TZ = tz;
    try {
      return fn();
    } finally {
      if (original === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = original;
      }
    }
  }

  it("Meetup #4 DTSTART is byte-identical under TZ=UTC and TZ=Europe/Warsaw", () => {
    const meetup4: IcsEvent = {
      uid: "event-2026-05-21-meetup-4",
      title: "AI Community | Meetup #4",
      start: [2026, 5, 21, 19, 0],
      tz: "Europe/Warsaw",
      duration: { minutes: 120 },
      location: "Grzybowska 85a, Warsaw",
    };

    const icsUnderUtc = withTz("UTC", () => generateIcs([meetup4]));
    const icsUnderWarsaw = withTz("Europe/Warsaw", () => generateIcs([meetup4]));

    const dtstartUtc = icsUnderUtc.match(/^DTSTART:.*$/m)?.[0];
    const dtstartWarsaw = icsUnderWarsaw.match(/^DTSTART:.*$/m)?.[0];

    expect(dtstartUtc).toBeDefined();
    expect(dtstartUtc).toBe(dtstartWarsaw);
    // 19:00 Warsaw CEST = 17:00 UTC on 2026-05-21 (CEST = UTC+2 in May).
    expect(dtstartUtc).toBe("DTSTART:20260521T170000Z");
  });

  it("winter event respects CET offset (UTC+1, not CEST UTC+2) on UTC build host", () => {
    // 2026-01-15 19:00 Warsaw CET = 18:00 UTC. Tests DST-aware conversion:
    // the offset must reflect that mid-January is outside CEST.
    // Wrapped in TZ=UTC to simulate the Vercel build host context — the bug
    // manifests precisely there. A CEST dev machine would coincidentally
    // produce correct output without the fix, masking the regression.
    const winterEvent: IcsEvent = {
      uid: "event-2026-01-15-winter",
      title: "Winter sync",
      start: [2026, 1, 15, 19, 0],
      tz: "Europe/Warsaw",
      duration: { minutes: 60 },
    };
    const ics = withTz("UTC", () => generateIcs([winterEvent]));
    expect(ics).toMatch(/^DTSTART:20260115T180000Z$/m);
  });

  it("UTC tz produces identity conversion (wall-clock = UTC instant) on UTC build host", () => {
    const ev: IcsEvent = {
      uid: "evt-utc",
      title: "Pure UTC event",
      start: [2026, 7, 4, 12, 30],
      tz: "UTC",
      duration: { minutes: 60 },
    };
    const ics = withTz("UTC", () => generateIcs([ev]));
    expect(ics).toMatch(/^DTSTART:20260704T123000Z$/m);
  });

  it("eventToIcsEvent wires tz from defaults onto the IcsEvent", () => {
    const ev = eventToIcsEvent(
      {
        date: "2026-05-21",
        slug: EventSlugSchema.parse("2026-05-21-meetup-4"),
        title: "AI Community | Meetup #4",
        body: "",
        status: "scheduled",
        startTime: "19:00",
        durationMinutes: 120,
        location: "Grzybowska 85a\\, Warsaw",
      },
      DEFAULTS,
    );
    expect(ev.tz).toBe("Europe/Warsaw");
    // start stays as wall-clock; conversion happens at generateIcs boundary.
    expect(ev.start).toEqual([2026, 5, 21, 19, 0]);
  });

  it("meetingToIcsEvent wires tz from defaults onto the IcsEvent", () => {
    const m = meetingToIcsEvent(
      { date: "2026-05-19", slug: "2026-05-19", title: "Weekly sync", body: "", attendees: [] },
      DEFAULTS,
    );
    expect(m.tz).toBe("Europe/Warsaw");
  });

  it("custom tz on defaults flows through eventToIcsEvent", () => {
    const tokyoDefaults: CommunityDefaults = {
      ...DEFAULTS,
      timezone: "Asia/Tokyo",
    };
    const ev = eventToIcsEvent(
      {
        date: "2026-05-21",
        slug: EventSlugSchema.parse("2026-05-21-meetup-4"),
        title: "AI Community | Meetup #4",
        body: "",
        status: "scheduled",
        startTime: "19:00",
        durationMinutes: 120,
      },
      tokyoDefaults,
    );
    expect(ev.tz).toBe("Asia/Tokyo");
    // 19:00 Tokyo (UTC+9, no DST) = 10:00 UTC same day.
    const ics = withTz("UTC", () => generateIcs([ev]));
    expect(ics).toMatch(/^DTSTART:20260521T100000Z$/m);
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
      tz: "UTC",
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
      tz: "UTC",
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
      tz: "UTC",
      duration: { minutes: 60 },
    }])).toThrow(/ical: createEvents returned non-string value/);
  });
});
