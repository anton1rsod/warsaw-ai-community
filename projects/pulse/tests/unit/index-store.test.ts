// tests/unit/index-store.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readIndex, writeIndex, createIndexStore } from "../../lib/notion/index-store.js";

let dir: string;
beforeAll(async () => { dir = await mkdtemp(path.join(tmpdir(), "pulse-idx-")); });
afterAll(async () => { await rm(dir, { recursive: true, force: true }); });

describe("index store", () => {
  it("readIndex returns {} when the file is missing", async () => {
    expect(await readIndex(path.join(dir, "nope.json"))).toEqual({});
  });

  it("store get/set/snapshot, and writeIndex/readIndex round-trip", async () => {
    const store = createIndexStore({});
    expect(store.get("projects:gbrain")).toBeUndefined();
    store.set("projects:gbrain", { pageId: "p1", dataSourceId: "ds1" });
    expect(store.get("projects:gbrain")).toEqual({ pageId: "p1", dataSourceId: "ds1" });

    const file = path.join(dir, "notion-index.json");
    await writeIndex(file, store.snapshot());
    expect(await readIndex(file)).toEqual({ "projects:gbrain": { pageId: "p1", dataSourceId: "ds1" } });
  });

  it("readIndex throws on a malformed file (fail-fast)", async () => {
    const file = path.join(dir, "bad.json");
    await writeIndex(file, {} as never);
    const { writeFile } = await import("node:fs/promises");
    await writeFile(file, JSON.stringify({ k: { pageId: 1 } }));
    await expect(readIndex(file)).rejects.toThrow();
  });
});
