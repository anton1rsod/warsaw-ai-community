import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { listMeetings, readMeeting, parseAttendees } from "@/lib/meetings";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.resolve(
  __dirname,
  "../fixtures/repo",
);

describe("listMeetings", () => {
  it("returns meetings sorted descending by date", async () => {
    const meetings = await listMeetings(FIXTURE_ROOT);
    const dates = meetings.map((m) => m.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
    expect(meetings.length).toBeGreaterThanOrEqual(2);
  });

  it("parses body and attendees from 2026-04-24.md", async () => {
    const meetings = await listMeetings(FIXTURE_ROOT);
    const m = meetings.find((x) => x.slug === "2026-04-24");
    expect(m).not.toBeUndefined();
    expect(m?.title).toContain("2026-04-24");
    expect(m?.body).toContain("Discussed plan.");
    expect(m?.attendees).toEqual(["Anton Safronov", "Alice Example"]);
  });

  it("returns empty attendees array when Attendees section is absent (2026-04-17)", async () => {
    const meetings = await listMeetings(FIXTURE_ROOT);
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
});

describe("listMeetings — empty directory", () => {
  it("returns empty array when meetings directory does not exist", async () => {
    const meetings = await listMeetings("/nonexistent/path");
    expect(meetings).toEqual([]);
  });
});
