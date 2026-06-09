// tests/unit/upsert.test.ts
import { describe, it, expect, vi } from "vitest";
import { upsertMany } from "../../lib/notion/upsert.js";
import { createThrottle } from "../../lib/notion/throttle.js";
import { createIndexStore } from "../../lib/notion/index-store.js";
import type { MirrorClient } from "../../lib/notion/client.js";

function fakeClient(queryResults: { id: string }[] = []) {
  return {
    dataSources: { query: vi.fn(async () => ({ results: queryResults, has_more: false, next_cursor: null })) },
    pages: {
      create: vi.fn(async () => ({ id: "created-1" })),
      update: vi.fn(async () => ({ id: "updated" })),
    },
  } satisfies MirrorClient;
}

const throttle = createThrottle({ sleep: async () => {} });
const rows = [{ externalId: "gbrain", properties: { Name: { title: [] } } }];

describe("upsertMany", () => {
  it("creates when absent (index empty + query empty)", async () => {
    const client = fakeClient([]);
    const store = createIndexStore({});
    await upsertMany(client, throttle, store, "projects", "ds1", rows);
    expect(client.pages.create).toHaveBeenCalledTimes(1);
    expect(client.pages.update).not.toHaveBeenCalled();
    expect(store.get("projects:gbrain")).toEqual({ pageId: "created-1", dataSourceId: "ds1" });
  });

  it("updates via index without querying", async () => {
    const client = fakeClient([]);
    const store = createIndexStore({ "projects:gbrain": { pageId: "p9", dataSourceId: "ds1" } });
    await upsertMany(client, throttle, store, "projects", "ds1", rows);
    expect(client.dataSources.query).not.toHaveBeenCalled();
    expect(client.pages.update).toHaveBeenCalledWith(expect.objectContaining({ page_id: "p9" }));
    expect(client.pages.create).not.toHaveBeenCalled();
  });

  it("updates via query when found but not indexed", async () => {
    const client = fakeClient([{ id: "found-7" }]);
    const store = createIndexStore({});
    await upsertMany(client, throttle, store, "projects", "ds1", rows);
    expect(client.pages.update).toHaveBeenCalledWith(expect.objectContaining({ page_id: "found-7" }));
    expect(client.pages.create).not.toHaveBeenCalled();
  });

  it("re-run produces no duplicate create", async () => {
    const client = fakeClient([]);
    const store = createIndexStore({});
    await upsertMany(client, throttle, store, "projects", "ds1", rows); // creates
    await upsertMany(client, throttle, store, "projects", "ds1", rows); // index hit → update
    expect(client.pages.create).toHaveBeenCalledTimes(1);
    expect(client.pages.update).toHaveBeenCalledTimes(1);
  });

  it("queries by the External ID filter and the data_source_id parent on create", async () => {
    const client = fakeClient([]);
    await upsertMany(client, throttle, createIndexStore({}), "projects", "ds1", rows);
    expect(client.dataSources.query).toHaveBeenCalledWith(expect.objectContaining({
      data_source_id: "ds1",
      filter: { property: "External ID", rich_text: { equals: "gbrain" } },
    }));
    expect(client.pages.create).toHaveBeenCalledWith(expect.objectContaining({
      parent: { type: "data_source_id", data_source_id: "ds1" },
    }));
  });
});
