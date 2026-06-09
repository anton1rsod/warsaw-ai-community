// tests/unit/repo-io.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readFileOrNull, readJson, listStatusFiles } from "../../lib/sources/repo-io.js";

let root: string;
beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "pulse-io-"));
  await mkdir(path.join(root, "community/status/2026-W18"), { recursive: true });
  await writeFile(path.join(root, "community/status/2026-W18/anton.md"), "x");
  await writeFile(path.join(root, "data.json"), JSON.stringify({ a: 1 }));
});
afterAll(async () => { await rm(root, { recursive: true, force: true }); });

describe("repo-io", () => {
  it("readFileOrNull returns content or null", async () => {
    expect(await readFileOrNull(path.join(root, "missing.md"))).toBeNull();
    expect(await readFileOrNull(path.join(root, "data.json"))).toContain("\"a\"");
  });
  it("readJson parses, throws on missing", async () => {
    expect(await readJson(path.join(root, "data.json"))).toEqual({ a: 1 });
    await expect(readJson(path.join(root, "missing.json"))).rejects.toThrow();
  });
  it("listStatusFiles returns absolute paths under community/status", async () => {
    const files = await listStatusFiles(root);
    expect(files).toHaveLength(1);
    expect(files[0]).toContain("2026-W18");
  });
});
