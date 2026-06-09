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

  it("readFileOrNull rethrows non-ENOENT errors (e.g. EISDIR — reading a directory path)", async () => {
    // Passing a directory path to readFile results in EISDIR, not ENOENT
    const dirPath = path.join(root, "community/status/2026-W18");
    await expect(readFileOrNull(dirPath)).rejects.toThrow();
  });

  it("listStatusFiles returns [] when community/status dir is absent", async () => {
    const emptyRoot = await mkdtemp(path.join(tmpdir(), "pulse-io-empty-"));
    try {
      const files = await listStatusFiles(emptyRoot);
      expect(files).toEqual([]);
    } finally {
      await rm(emptyRoot, { recursive: true, force: true });
    }
  });

  it("listStatusFiles skips a file entry that is not a directory under community/status", async () => {
    const r = await mkdtemp(path.join(tmpdir(), "pulse-io-mixed-"));
    try {
      await mkdir(path.join(r, "community/status"), { recursive: true });
      // Write a plain file inside community/status (not a directory) — readdir on it should fail/skip
      await writeFile(path.join(r, "community/status/not-a-dir.md"), "# noise");
      // Also add a real week dir with a status file
      await mkdir(path.join(r, "community/status/2026-W20"), { recursive: true });
      await writeFile(path.join(r, "community/status/2026-W20/user.md"), "# status");
      const files = await listStatusFiles(r);
      // The plain file "not-a-dir.md" is skipped; only "2026-W20/user.md" is returned
      expect(files).toHaveLength(1);
      expect(files[0]).toContain("2026-W20");
    } finally {
      await rm(r, { recursive: true, force: true });
    }
  });
});
