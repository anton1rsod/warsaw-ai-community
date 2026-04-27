import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, copyFileSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: () => {
    const provider: any = (m: string) => ({ modelId: m });
    provider.embedding = (m: string) => ({ modelId: m });
    return provider;
  }
}));

vi.mock("ai", () => ({
  embed: vi.fn(async () => ({ embedding: Array.from({ length: 768 }, () => 0.1), usage: { tokens: 1 } }))
}));

function copyDir(src: string, dst: string) {
  mkdirSync(dst, { recursive: true });
  for (const f of readdirSync(src)) {
    const sp = path.join(src, f);
    const dp = path.join(dst, f);
    if (statSync(sp).isDirectory()) copyDir(sp, dp);
    else copyFileSync(sp, dp);
  }
}

describe("build-index.ts", () => {
  let tmpRepo: string;
  beforeEach(() => {
    tmpRepo = mkdtempSync(path.join(tmpdir(), "gb-build-"));
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const fixtures = path.join(__dirname, "..", "fixtures", "archive");
    copyDir(fixtures, path.join(tmpRepo, "community", "archive"));
  });
  afterEach(() => {
    rmSync(tmpRepo, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("walks archive, builds index.json + manifest.json", async () => {
    const { buildIndex } = await import("../../scripts/build-index");
    await buildIndex({ repoRoot: tmpRepo });
    const indexPath = path.join(tmpRepo, "community/archive/_index/index.json");
    const manifestPath = path.join(tmpRepo, "community/archive/_index/manifest.json");
    const index = JSON.parse(readFileSync(indexPath, "utf8"));
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    expect(Array.isArray(index)).toBe(true);
    expect(index.length).toBeGreaterThan(0);
    expect(manifest.embedding_model).toBe("gemini-embedding-001");
    expect(manifest.embedding_dim).toBe(768);
    expect(manifest.schema_version).toBe(1);
  });

  it("excludes _index/ and _removed/ from indexed paths", async () => {
    mkdirSync(path.join(tmpRepo, "community/archive/_removed"), { recursive: true });
    writeFileSync(path.join(tmpRepo, "community/archive/_removed/x.md"), "---\n---\nshould-not-be-indexed");
    const { buildIndex } = await import("../../scripts/build-index");
    await buildIndex({ repoRoot: tmpRepo });
    const index = JSON.parse(readFileSync(path.join(tmpRepo, "community/archive/_index/index.json"), "utf8"));
    for (const e of index) {
      expect(e.source_path).not.toMatch(/_removed/);
      expect(e.source_path).not.toMatch(/_index/);
    }
  });

  it("incremental rebuild reuses unchanged embeddings", async () => {
    const { buildIndex } = await import("../../scripts/build-index");
    const ai = await import("ai");
    await buildIndex({ repoRoot: tmpRepo });
    const callsAfterFirst = (ai.embed as any).mock.calls.length;
    await buildIndex({ repoRoot: tmpRepo });
    const callsAfterSecond = (ai.embed as any).mock.calls.length;
    expect(callsAfterSecond - callsAfterFirst).toBe(0);
  });
});
