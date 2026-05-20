import { createEvents, type EventAttributes } from "ics";
import type { CommunityDefaults } from "./community-defaults";
import type { Event } from "./events";
import type { Meeting } from "./meetings";

export type WallClockTuple = [number, number, number, number, number];

export interface IcsEvent {
  uid: string;
  title: string;
  /** Wall-clock time `[YYYY, M, D, H, m]` in the `tz` timezone (1-indexed month). */
  start: WallClockTuple;
  /** IANA timezone identifier (e.g. `Europe/Warsaw`, `UTC`). */
  tz: string;
  duration: { minutes: number };
  location?: string;
  description?: string;
  url?: string;
}

function parseHHMM(s: string): [number, number] {
  const [h, m] = s.split(":");
  if (!h || !m) throw new Error(`ical: invalid HH:MM "${s}"`);
  return [Number(h), Number(m)];
}

function dateToIcsParts(dateISO: string, hhmm: string): WallClockTuple {
  const [y, mo, d] = dateISO.split("-").map(Number);
  const [hh, mm] = parseHHMM(hhmm);
  if (!y || !mo || !d) throw new Error(`ical: invalid date "${dateISO}"`);
  return [y, mo, d, hh, mm];
}

/**
 * Compute the offset of `tz` from UTC, in milliseconds, at the given UTC instant.
 * Positive for zones east of UTC. Reads IANA TZ data via the V8 ICU bundle —
 * DST-aware, no host `process.env.TZ` dependence.
 *
 * Example: Europe/Warsaw at any May instant returns `7200000` (CEST = UTC+2);
 * at any January instant returns `3600000` (CET = UTC+1).
 */
function getTzOffsetMs(tz: string, instantMs: number): number {
  const date = new Date(instantMs);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const lookup: Record<string, string> = {};
  for (const part of parts) lookup[part.type] = part.value;
  // Some ICU builds emit `24` for midnight under `hour12:false`; normalize.
  const hour = lookup.hour === "24" ? 0 : Number(lookup.hour ?? "0");
  const tzAsUtc = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    hour,
    Number(lookup.minute ?? "0"),
    Number(lookup.second ?? "0"),
  );
  return tzAsUtc - instantMs;
}

/**
 * Convert a wall-clock tuple in `tz` to the equivalent UTC wall-clock tuple.
 * The result is the calendar parts of the UTC instant that, when displayed in
 * `tz`, shows the input wall-clock.
 *
 * Why: the `ics` package's default `startInputType: 'local'` interprets the
 * tuple as the build host's local time — wrong on Vercel (UTC). By
 * pre-converting and declaring `startInputType: 'utc'`, the output is pinned
 * regardless of host TZ.
 */
function wallClockInTzToUtcParts(
  wallClock: WallClockTuple,
  tz: string,
): WallClockTuple {
  const [y, mo, d, h, m] = wallClock;
  // Naive UTC instant treating wall-clock as if it were UTC. Used as a
  // reference point for the offset lookup; the offset depends on the instant
  // (due to DST), so we lose at most ~1h of accuracy near a DST transition.
  const naiveUtcMs = Date.UTC(y, mo - 1, d, h, m, 0);
  const offsetMs = getTzOffsetMs(tz, naiveUtcMs);
  const trueUtcMs = naiveUtcMs - offsetMs;
  const dt = new Date(trueUtcMs);
  return [
    dt.getUTCFullYear(),
    dt.getUTCMonth() + 1,
    dt.getUTCDate(),
    dt.getUTCHours(),
    dt.getUTCMinutes(),
  ];
}

export function meetingToIcsEvent(
  meeting: Meeting & { startTime?: string; durationMinutes?: number; location?: string },
  defaults: CommunityDefaults,
): IcsEvent {
  const hhmm = meeting.startTime ?? defaults.meetings.defaultStartTime;
  const duration = meeting.durationMinutes ?? defaults.meetings.defaultDurationMinutes;
  const location = meeting.location ?? defaults.meetings.defaultLocation;
  return {
    uid: `meeting-${meeting.slug}`,
    title: meeting.title,
    start: dateToIcsParts(meeting.date, hhmm),
    tz: defaults.timezone,
    duration: { minutes: duration },
    location,
  };
}

export function eventToIcsEvent(
  event: Event,
  defaults: CommunityDefaults,
): IcsEvent {
  const hhmm = event.startTime ?? defaults.events.defaultStartTime;
  const duration = event.durationMinutes ?? defaults.events.defaultDurationMinutes;
  const location = event.location ?? defaults.events.defaultLocation;
  return {
    uid: `event-${event.slug}`,
    title: event.title,
    start: dateToIcsParts(event.date, hhmm),
    tz: defaults.timezone,
    duration: { minutes: duration },
    location,
    url: event.url,
  };
}

export function generateIcs(events: IcsEvent[]): string {
  const attrs: EventAttributes[] = events.map((e) => ({
    uid: e.uid,
    title: e.title,
    start: wallClockInTzToUtcParts(e.start, e.tz),
    startInputType: "utc",
    startOutputType: "utc",
    duration: e.duration,
    location: e.location,
    description: e.description,
    url: e.url,
  }));
  const { error, value } = createEvents(attrs);
  if (error) {
    throw new Error(`ical: createEvents failed — ${error.message ?? String(error)}`);
  }
  if (typeof value !== "string") {
    throw new Error("ical: createEvents returned non-string value");
  }
  return value;
}
