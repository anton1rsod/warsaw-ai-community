import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

beforeEach(() => {
  vi.resetModules();
});

describe("H37 + H48: /api/calendar.ics route (public ICS subscribe)", () => {
  it("returns text/calendar with cache headers + body", async () => {
    const { readFile } = await import("node:fs/promises");
    vi.mocked(readFile).mockResolvedValue(
      "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n"
    );
    const { GET } = await import("@/app/api/calendar.ics/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/calendar/);
    expect(res.headers.get("cache-control")).toMatch(
      /public, max-age=300, s-maxage=300/
    );
    const body = await res.text();
    expect(body).toMatch(/^BEGIN:VCALENDAR/);
    expect(body).toMatch(/END:VCALENDAR/);
  });

  it("propagates fs error (caller sees 500 from the framework)", async () => {
    const { readFile } = await import("node:fs/promises");
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
    const { GET } = await import("@/app/api/calendar.ics/route");
    await expect(GET()).rejects.toThrow(/ENOENT/);
  });
});
