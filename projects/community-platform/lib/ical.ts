import { createEvents, type EventAttributes } from "ics";
import type { CommunityDefaults } from "./community-defaults";
import type { Event } from "./events";
import type { Meeting } from "./meetings";

export interface IcsEvent {
  uid: string;
  title: string;
  start: EventAttributes["start"];
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

function dateToIcsParts(dateISO: string, hhmm: string): EventAttributes["start"] {
  const [y, mo, d] = dateISO.split("-").map(Number);
  const [hh, mm] = parseHHMM(hhmm);
  if (!y || !mo || !d) throw new Error(`ical: invalid date "${dateISO}"`);
  return [y, mo, d, hh, mm];
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
    duration: { minutes: duration },
    location,
    url: event.url,
  };
}

export function generateIcs(events: IcsEvent[]): string {
  const attrs: EventAttributes[] = events.map((e) => ({
    uid: e.uid,
    title: e.title,
    start: e.start,
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
