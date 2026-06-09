// tests/integration/sync-notion.test.ts
import { describe, it, expect, vi } from "vitest";
import { runSync } from "../../scripts/sync-notion.js";
import { createThrottle } from "../../lib/notion/throttle.js";
import { createIndexStore } from "../../lib/notion/index-store.js";

function fakeClient() {
  return {
    databases: { retrieve: vi.fn(async () => ({ data_sources: [{ id: "ds" }] })) },
    dataSources: { query: vi.fn(async () => ({ results: [], has_more: false, next_cursor: null })) },
    pages: { create: vi.fn(async () => ({ id: "new" })), update: vi.fn(async () => ({ id: "u" })) },
  };
}

describe("runSync", () => {
  it("resolves a data source per DB and creates one page per row", async () => {
    const client = fakeClient();
    const store = createIndexStore({});
    await runSync({
      mirrorClient: client as never,
      dbIds: { projects: "p", decisions: "d", shipping: "s", engagement: "e" },
      data: {
        projects: [{ slug: "gbrain", name: "GBrain", path: "projects/gbrain/", status: "Building", dri: "Anton", version: "v0.1", currentFocus: "x", nextGate: "y" }],
        decisions: [{ id: "0001", adr: "ADR-0001", title: "t", status: "Accepted", date: "2026-04-24", path: "docs/decisions/0001-x.md" }],
        releases: [{ project: "gbrain", version: "0.1.0", date: "2026-04-26", summary: "s" }],
        engagement: [{ handle: "anton1rsod", name: "Anton", contributions: 1, kudos: 0, statusStreak: 0, eventsAttended: 0 }],
      },
      store,
      throttle: createThrottle({ sleep: async () => {} }),
      syncedAt: "2026-06-09T00:00:00.000Z",
      repoUrl: "https://github.com/x/y",
    });
    expect(client.databases.retrieve).toHaveBeenCalledTimes(4);
    expect(client.pages.create).toHaveBeenCalledTimes(4);
    expect(Object.keys(store.snapshot())).toEqual(
      expect.arrayContaining(["projects:gbrain", "decisions:ADR-0001", "shipping:gbrain@0.1.0", "engagement:anton1rsod"]),
    );
  });
});
