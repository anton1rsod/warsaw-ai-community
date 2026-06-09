// tests/unit/types.test.ts
import { describe, it, expect } from "vitest";
import { ProjectSchema, AdrSchema, ReleaseSchema, EngagementSchema, RepoStateSchema } from "../../lib/types.js";

describe("domain schemas", () => {
  it("ProjectSchema accepts a valid project and rejects a bad status", () => {
    const ok = { slug: "gbrain", name: "GBrain", path: "projects/gbrain/", status: "Building", dri: "Anton", version: "", currentFocus: "x", nextGate: "y" };
    expect(ProjectSchema.parse(ok).slug).toBe("gbrain");
    expect(() => ProjectSchema.parse({ ...ok, status: "Wat" })).toThrow();
  });

  it("AdrSchema requires a 4-digit id and a date", () => {
    const ok = { id: "0017", adr: "ADR-0017", title: "Yuriy peer co-founder", status: "Accepted", date: "2026-06-09", path: "docs/decisions/0017-x.md" };
    expect(AdrSchema.parse(ok).adr).toBe("ADR-0017");
    expect(() => AdrSchema.parse({ ...ok, date: "nope" })).toThrow();
  });

  it("ReleaseSchema + EngagementSchema + RepoStateSchema parse valid shapes", () => {
    expect(ReleaseSchema.parse({ project: "gbrain", version: "0.1.1", date: "2026-04-26", summary: "x" }).version).toBe("0.1.1");
    expect(EngagementSchema.parse({ handle: "anton1rsod", name: "Anton", contributions: 5, kudos: 0, statusStreak: 2, eventsAttended: 1 }).handle).toBe("anton1rsod");
    expect(RepoStateSchema.parse({ lastUpdated: "2026-06-09", drivers: [], hotNow: [], blockers: [] }).hotNow).toEqual([]);
  });
});
