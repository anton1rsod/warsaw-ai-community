import fs from "node:fs/promises";
import path from "node:path";

export interface Meeting {
  slug: string;
  date: string;
  title: string;
  body: string;
  attendees: readonly string[];
}

const FILE_RE = /^(\d{4}-\d{2}-\d{2})\.md$/;
const SLUG_RE = /^(\d{4}-\d{2}-\d{2})$/;

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

export async function listMeetings(repoRoot: string): Promise<Meeting[]> {
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
    const body = await fs.readFile(filePath, "utf8");
    const slug = name.replace(/\.md$/, "");
    meetings.push({
      slug,
      date,
      title: extractTitle(body, `Weekly meeting — ${date}`),
      body,
      attendees: parseAttendees(body),
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
    const body = await fs.readFile(filePath, "utf8");
    const m = slug.match(SLUG_RE);
    if (!m || !m[1]) return null;
    const date = m[1];
    return {
      slug,
      date,
      title: extractTitle(body, `Weekly meeting — ${date}`),
      body,
      attendees: parseAttendees(body),
    };
  } catch {
    return null;
  }
}
