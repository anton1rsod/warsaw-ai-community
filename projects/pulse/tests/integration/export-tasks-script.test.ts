// tests/integration/export-tasks-script.test.ts
import { describe, it, expect, vi, afterAll } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runTaskExport } from "../../scripts/export-tasks.js";
import { createThrottle } from "../../lib/notion/throttle.js";

let dir: string;
afterAll(async () => { if (dir) await rm(dir, { recursive: true, force: true }); });

describe("runTaskExport", () => {
  it("resolves the data source, dumps rows, writes the snapshot file", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "pulse-snap-"));
    const out = path.join(dir, "tasks-snapshot.json");
    const client = {
      databases: { retrieve: vi.fn(async () => ({ data_sources: [{ id: "ds_tasks" }] })) },
      dataSources: { query: vi.fn(async () => ({ results: [{ id: "t1" }, { id: "t2" }], has_more: false, next_cursor: null })) },
    };
    const rows = await runTaskExport({
      exportClient: client as never,
      retrievableClient: client as never,
      tasksDbId: "db_tasks",
      throttle: createThrottle({ sleep: async () => {} }),
      outPath: out,
    });
    expect(rows).toHaveLength(2);
    const written = JSON.parse(await readFile(out, "utf8"));
    expect(written.count).toBe(2);
    expect(written.rows.map((r: any) => r.id)).toEqual(["t1", "t2"]);
  });
});
