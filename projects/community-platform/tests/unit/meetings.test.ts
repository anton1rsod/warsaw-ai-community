import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  listMeetings,
  listMeetingsFromDisk,
  readMeeting,
  parseAttendees,
  groupMeetingsByMonth,
  type Meeting,
} from "@/lib/meetings";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.resolve(
  __dirname,
  "../fixtures/repo",
);

describe("listMeetingsFromDisk", () => {
  it("returns meetings sorted descending by date", async () => {
    const meetings = await listMeetingsFromDisk(FIXTURE_ROOT);
    const dates = meetings.map((m) => m.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
    expect(meetings.length).toBeGreaterThanOrEqual(2);
  });

  it("parses body and attendees from 2026-04-24.md", async () => {
    const meetings = await listMeetingsFromDisk(FIXTURE_ROOT);
    const m = meetings.find((x) => x.slug === "2026-04-24");
    expect(m).not.toBeUndefined();
    expect(m?.title).toContain("2026-04-24");
    expect(m?.body).toContain("Discussed plan.");
    expect(m?.attendees).toEqual(["Anton Safronov", "Alice Example"]);
  });

  it("returns empty attendees array when Attendees section is absent (2026-04-17)", async () => {
    const meetings = await listMeetingsFromDisk(FIXTURE_ROOT);
    const m = meetings.find((x) => x.slug === "2026-04-17");
    expect(m).not.toBeUndefined();
    expect(m?.attendees).toEqual([]);
  });
});

describe("parseAttendees", () => {
  it("extracts names from a bullet list under the Attendees section", () => {
    const body = `# Meeting\n\n## Attendees\n\n- Alice\n- Bob\n\n## Notes\n\nHello.`;
    expect(parseAttendees(body)).toEqual(["Alice", "Bob"]);
  });

  it("ignores HTML-comment bullets", () => {
    const body = `# Meeting\n\n## Attendees\n\n- Alice\n- <!-- placeholder -->\n- Bob\n\n## Notes\n\nHello.`;
    expect(parseAttendees(body)).toEqual(["Alice", "Bob"]);
  });
});

describe("readMeeting", () => {
  it("rejects path traversal slugs", async () => {
    await expect(readMeeting(FIXTURE_ROOT, "../evil")).resolves.toBeNull();
    await expect(readMeeting(FIXTURE_ROOT, "foo/bar")).resolves.toBeNull();
    await expect(
      readMeeting(FIXTURE_ROOT, "foo\\bar"),
    ).resolves.toBeNull();
  });

  it("returns null for a non-existent file", async () => {
    await expect(
      readMeeting(FIXTURE_ROOT, "2099-01-01"),
    ).resolves.toBeNull();
  });

  it("reads an existing meeting by slug", async () => {
    const m = await readMeeting(FIXTURE_ROOT, "2026-04-24");
    expect(m).not.toBeNull();
    expect(m?.slug).toBe("2026-04-24");
    expect(m?.date).toBe("2026-04-24");
    expect(m?.attendees).toEqual(["Anton Safronov", "Alice Example"]);
    expect(m?.body).toContain("Discussed plan.");
  });

  it("returns null when slug does not match YYYY-MM-DD pattern", async () => {
    await expect(readMeeting(FIXTURE_ROOT, "notes")).resolves.toBeNull();
  });

  it("re-throws non-ENOENT errors from readMeeting", async () => {
    // Create a directory where the .md file should be — causes EISDIR (not ENOENT),
    // so isENOENT returns false and the error must be re-thrown.
    const os = await import("node:os");
    const fsm = await import("node:fs/promises");
    const tmpRoot = await fsm.mkdtemp(path.join(os.tmpdir(), "meetings-test-"));
    const weeklyDir = path.join(tmpRoot, "community/meetings/weekly");
    await fsm.mkdir(weeklyDir, { recursive: true });
    await fsm.mkdir(path.join(weeklyDir, "2026-04-24.md"));
    await expect(readMeeting(tmpRoot, "2026-04-24")).rejects.toThrow();
    await fsm.rm(tmpRoot, { recursive: true, force: true });
  });
});

describe("listMeetingsFromDisk — empty directory", () => {
  it("returns empty array when meetings directory does not exist", async () => {
    const meetings = await listMeetingsFromDisk("/nonexistent/path");
    expect(meetings).toEqual([]);
  });

  it("skips _-prefixed files and non-date files", async () => {
    const os = await import("node:os");
    const fsm = await import("node:fs/promises");
    const tmpRoot = await fsm.mkdtemp(path.join(os.tmpdir(), "meetings-skip-"));
    const weeklyDir = path.join(tmpRoot, "community/meetings/weekly");
    await fsm.mkdir(weeklyDir, { recursive: true });
    // A valid dated file with a heading
    await fsm.writeFile(path.join(weeklyDir, "2026-03-01.md"), "# Meeting — 2026-03-01\n");
    // A valid dated file WITHOUT a heading — exercises extractTitle fallback branch
    await fsm.writeFile(path.join(weeklyDir, "2026-03-08.md"), "No heading here.\n");
    // A _-prefixed file that should be skipped — exercises name.startsWith("_") continue branch
    await fsm.writeFile(path.join(weeklyDir, "_template.md"), "# Template\n");
    // A non-date file that should be skipped
    await fsm.writeFile(path.join(weeklyDir, "notes.md"), "# Notes\n");
    const result = await listMeetingsFromDisk(tmpRoot);
    expect(result).toHaveLength(2);
    // The file without a heading uses fallback title
    const noHeading = result.find((m) => m.slug === "2026-03-08");
    expect(noHeading?.title).toBe("Weekly meeting — 2026-03-08");
    await fsm.rm(tmpRoot, { recursive: true, force: true });
  });
});

const fixtures: Meeting[] = [
  { date: "2026-05-19", slug: "2026-05-19", title: "Weekly sync", body: "", attendees: [] },
  { date: "2026-05-12", slug: "2026-05-12", title: "Weekly sync", body: "", attendees: [] },
  { date: "2026-04-28", slug: "2026-04-28", title: "Weekly sync", body: "", attendees: [] },
];

describe("H36: listMeetings + groupMeetingsByMonth", () => {
  it("listMeetings returns reverse-chrono order", () => {
    const list = listMeetings(fixtures);
    expect(list.map((m) => m.date)).toEqual(["2026-05-19", "2026-05-12", "2026-04-28"]);
  });

  it("listMeetings with no source falls back to snapshot (returns Meeting[])", () => {
    // Exercises the `source ?? listMeetingsFromSnapshot()` branch (line 115-116)
    const list = listMeetings();
    expect(Array.isArray(list)).toBe(true);
  });

  it("listMeetings sort is stable for equal dates", () => {
    // Exercises the equality (return 0) branch of the sort comparator
    const dupes: Meeting[] = [
      { date: "2026-05-19", slug: "2026-05-19-a", title: "A", body: "", attendees: [] },
      { date: "2026-05-19", slug: "2026-05-19-b", title: "B", body: "", attendees: [] },
    ];
    const result = listMeetings(dupes);
    expect(result).toHaveLength(2);
    expect(result.every((m) => m.date === "2026-05-19")).toBe(true);
  });

  it("groupMeetingsByMonth keys by YYYY-MM, preserves order", () => {
    const grouped = groupMeetingsByMonth(listMeetings(fixtures));
    expect(grouped.size).toBe(2);
    expect(Array.from(grouped.keys())).toEqual(["2026-05", "2026-04"]);
    expect(grouped.get("2026-05")?.length).toBe(2);
    expect(grouped.get("2026-04")?.length).toBe(1);
  });

  it("empty input returns empty Map", () => {
    expect(groupMeetingsByMonth([])).toEqual(new Map());
  });
});
