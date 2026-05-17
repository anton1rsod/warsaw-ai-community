import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface Meeting {
  slug: string;
  date: string;
  title: string;
  body: string;
  attendees: readonly string[];
  // v0.3: optional extended frontmatter (parsed from gray-matter)
  startTime?: string;       // "HH:MM" — falls back to defaults at ICS render time
  durationMinutes?: number; // positive integer
  location?: string;
  host?: string;            // member slug of the meeting host; drives ThankButton
}

const FILE_RE = /^(\d{4}-\d{2}-\d{2})\.md$/;
const SLUG_RE = /^(\d{4}-\d{2}-\d{2})$/;

function isENOENT(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "ENOENT"
  );
}

function extractTitle(body: string, fallback: string): string {
  return body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

export function parseAttendees(body: string): string[] {
  // Match the Attendees section up to the next H2 heading or end-of-string.
  // \z is invalid in JS regex; use $(?![\s\S]) to assert true end-of-string
  // under the /m flag (where bare $ only anchors at end-of-line).
  const match = body.match(
    /^##\s+Attendees\s*$([\s\S]*?)(?=^##\s|$(?![\s\S]))/m,
  );
  if (!match || !match[1]) return [];

  const section = match[1];
  return section
    .split("\n")
    .filter((line) => line.trimStart().startsWith("- "))
    .map((line) => line.replace(/^[\s]*-\s+/, "").trim())
    .filter((item) => item.length > 0 && !item.startsWith("<!--"));
}

// RENAMED from listMeetings to listMeetingsFromDisk (collision fix — see Task 1.3)
export async function listMeetingsFromDisk(repoRoot: string): Promise<Meeting[]> {
  const dir = path.join(repoRoot, "community/meetings/weekly");
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  const meetings: Meeting[] = [];

  for (const name of entries) {
    // Skip template-style files (starting with _)
    if (name.startsWith("_")) continue;
    const m = name.match(FILE_RE);
    if (!m || !m[1]) continue;
    const date = m[1];
    const filePath = path.join(dir, name);
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const slug = name.replace(/\.md$/, "");
    const startTime =
      typeof data.start_time === "string" &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(data.start_time)
        ? data.start_time
        : undefined;
    const durationMinutes =
      typeof data.duration_minutes === "number" &&
      Number.isInteger(data.duration_minutes) &&
      data.duration_minutes > 0
        ? data.duration_minutes
        : undefined;
    const location =
      typeof data.location === "string" && data.location.length > 0
        ? data.location
        : undefined;
    const host =
      typeof data.host === "string" && data.host.length > 0
        ? data.host
        : undefined;
    meetings.push({
      slug,
      date,
      title: extractTitle(content, `Weekly meeting — ${date}`),
      body: content,
      attendees: parseAttendees(content),
      startTime,
      durationMinutes,
      location,
      host,
    });
  }

  meetings.sort((a, b) => b.date.localeCompare(a.date));
  return meetings;
}

export async function readMeeting(
  repoRoot: string,
  slug: string,
): Promise<Meeting | null> {
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\"))
    return null;
  const filePath = path.join(
    repoRoot,
    "community/meetings/weekly",
    `${slug}.md`,
  );
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const m = slug.match(SLUG_RE);
    if (!m || !m[1]) return null;
    const date = m[1];
    const startTime =
      typeof data.start_time === "string" &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(data.start_time)
        ? data.start_time
        : undefined;
    const durationMinutes =
      typeof data.duration_minutes === "number" &&
      Number.isInteger(data.duration_minutes) &&
      data.duration_minutes > 0
        ? data.duration_minutes
        : undefined;
    const location =
      typeof data.location === "string" && data.location.length > 0
        ? data.location
        : undefined;
    const host =
      typeof data.host === "string" && data.host.length > 0
        ? data.host
        : undefined;
    return {
      slug,
      date,
      title: extractTitle(content, `Weekly meeting — ${date}`),
      body: content,
      attendees: parseAttendees(content),
      startTime,
      durationMinutes,
      location,
      host,
    };
  } catch (err: unknown) {
    if (isENOENT(err)) return null;
    throw err;
  }
}

/**
 * Returns meetings reverse-chronological (newest first).
 * Pass an explicit `source` array (typically `listMeetingsFromSnapshot()` from lib/content-snapshot,
 * or a fixture in tests). Source is required so this module doesn't transitively load
 * content-snapshot.ts (GOTCHAS row 10 — that edge breaks the tsx prebuild chain on Vercel).
 */
export function listMeetings(source: readonly Meeting[]): Meeting[] {
  return [...source].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Groups meetings by YYYY-MM key for the /meetings index page.
 * Map preserves insertion order — pass listMeetings() output for reverse-chrono group order.
 */
export function groupMeetingsByMonth(
  meetings: readonly Meeting[],
): Map<string, Meeting[]> {
  const out = new Map<string, Meeting[]>();
  for (const m of meetings) {
    const monthKey = m.date.slice(0, 7); // YYYY-MM
    const bucket = out.get(monthKey) ?? [];
    bucket.push(m);
    out.set(monthKey, bucket);
  }
  return out;
}
