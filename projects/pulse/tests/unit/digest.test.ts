// tests/unit/digest.test.ts
import { describe, it, expect, vi } from "vitest";
import { publishDigest } from "../../lib/notion/digest.js";
import { createThrottle } from "../../lib/notion/throttle.js";
import { createIndexStore } from "../../lib/notion/index-store.js";

const throttle = createThrottle({ sleep: async () => {} });
const fake = () => ({ pages: { create: vi.fn(async () => ({ id: "page-1" })), updateMarkdown: vi.fn(async () => ({})) } });

describe("publishDigest", () => {
  it("creates the page then writes markdown when absent", async () => {
    const client = fake();
    const store = createIndexStore({});
    const id = await publishDigest(client, throttle, store, "parent", "2026-06", "Monthly Review — June 2026", "# hi");
    expect(id).toBe("page-1");
    expect(client.pages.create).toHaveBeenCalledTimes(1);
    expect(client.pages.updateMarkdown).toHaveBeenCalledWith({ page_id: "page-1", markdown: "# hi" });
    expect(store.get("digest:2026-06")).toEqual({ pageId: "page-1", dataSourceId: "parent" });
  });

  it("reuses the indexed page on re-run (no duplicate create)", async () => {
    const client = fake();
    const store = createIndexStore({ "digest:2026-06": { pageId: "p-existing", dataSourceId: "parent" } });
    await publishDigest(client, throttle, store, "parent", "2026-06", "x", "# again");
    expect(client.pages.create).not.toHaveBeenCalled();
    expect(client.pages.updateMarkdown).toHaveBeenCalledWith({ page_id: "p-existing", markdown: "# again" });
  });
});
