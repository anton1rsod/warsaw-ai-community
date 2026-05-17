import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateIcs, meetingToIcsEvent, eventToIcsEvent, type IcsEvent } from "../lib/ical";
import { getDefaults } from "../lib/community-defaults";
import { listMeetingsFromSnapshot, listEventsFromSnapshot } from "../lib/content-snapshot";
import type { Meeting } from "../lib/meetings";
import type { Event } from "../lib/events";
import type { CommunityDefaults } from "../lib/community-defaults";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function computeCalendarEvents(
  meetings: readonly Meeting[],
  events: readonly Event[],
  now: Date,
  defaults: CommunityDefaults,
): IcsEvent[] {
  const cutoffISO = new Date(now.getTime() - THIRTY_DAYS_MS).toISOString().slice(0, 10);
  const out: IcsEvent[] = [];
  for (const m of meetings) {
    if (m.date < cutoffISO) continue;
    out.push(meetingToIcsEvent(m, defaults));
  }
  for (const e of events) {
    if (e.status === "cancelled") continue;
    if (e.date < cutoffISO) continue;
    out.push(eventToIcsEvent(e, defaults));
  }
  return out;
}

export function main(): void {
  const defaults = getDefaults();
  const meetings = listMeetingsFromSnapshot();
  const events = listEventsFromSnapshot();
  const icsEvents = computeCalendarEvents(meetings, events, new Date(), defaults);
  const ics =
    icsEvents.length > 0
      ? generateIcs(icsEvents)
      : "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Warsaw AI Community//EN\r\nEND:VCALENDAR\r\n";
  const outPath = path.resolve(__dirname, "..", "lib", "__generated__", "calendar.ics");
  writeFileSync(outPath, ics, "utf-8");
  console.log(`[build-calendar] wrote ${icsEvents.length} events → ${outPath}`);
}

if (process.argv[1]?.endsWith("build-calendar.ts")) {
  main();
}
