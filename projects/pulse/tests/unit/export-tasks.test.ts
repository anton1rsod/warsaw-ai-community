// tests/unit/export-tasks.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { exportTasks } from "../../lib/notion/export-tasks.js";
import { createThrottle } from "../../lib/notion/throttle.js";
import type { ExportClient } from "../../lib/notion/client.js";

const throttle = createThrottle({ sleep: async () => {} });

describe("exportTasks", () => {
  it("concatenates all pages following next_cursor", async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ results: [{ id: "a" }], has_more: true, next_cursor: "c1" })
      .mockResolvedValueOnce({ results: [{ id: "b" }], has_more: false, next_cursor: null });
    const client: ExportClient = { dataSources: { query } };

    const rows = await exportTasks(client, "ds_tasks", throttle);
    expect(rows.map((r: any) => r.id)).toEqual(["a", "b"]);
    expect(query).toHaveBeenNthCalledWith(2, expect.objectContaining({ start_cursor: "c1", data_source_id: "ds_tasks" }));
  });

  it("never invokes a write method (read-only by capability)", async () => {
    const create = vi.fn();
    const update = vi.fn();
    const client = {
      dataSources: { query: vi.fn(async () => ({ results: [], has_more: false, next_cursor: null })) },
      pages: { create, update },
    };
    await exportTasks(client as unknown as ExportClient, "ds", throttle);
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
