import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

async function freshLoader(cwd: string) {
  vi.resetModules();
  vi.spyOn(process, "cwd").mockReturnValue(cwd);
  const mod = await import("@/retrieval/load");
  return mod;
}

const VALID_MANIFEST = {
  built_at: "2026-04-26T00:00:00Z",
  built_by_workflow: "test#1",
  embedding_model: "gemini-embedding-001",
  embedding_dim: 768,
  source_files_hash: "c".repeat(64),
  schema_version: 1,
  stats: { total_chunks: 1, total_source_files: 1, total_embeddings_generated_this_run: 0, total_embeddings_reused_this_run: 0, total_embeddings_failed_this_run: 0, embed_failed_chunks: [], build_ms: 1 }
};

const VALID_ENTRY = {
  id: "a".repeat(64),
  source_path: "x.md",
  source_lines: [1, 1],
  chunk_hash: "b".repeat(64),
  embedding: Array.from({ length: 768 }, () => 0),
  content_preview: "p",
  metadata: { author_handle: "@a", topic: "t", timestamp_iso: "2026-04-26T00:00:00Z", source_link: "https://x.com/x.md" }
};

describe("getIndex()", () => {
  let tmp: string;
  beforeEach(() => {
    tmp = mkdtempSync(path.join(tmpdir(), "gb-load-"));
    mkdirSync(path.join(tmp, "data", "_index"), { recursive: true });
  });
  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("returns LoadedIndex for a valid index + manifest", async () => {
    writeFileSync(path.join(tmp, "data/_index/index.json"), JSON.stringify([VALID_ENTRY]));
    writeFileSync(path.join(tmp, "data/_index/manifest.json"), JSON.stringify(VALID_MANIFEST));
    const { getIndex } = await freshLoader(tmp);
    const result = getIndex();
    expect("entries" in result).toBe(true);
    if ("entries" in result) {
      expect(result.entries.length).toBe(1);
      expect(result.manifest.embedding_model).toBe("gemini-embedding-001");
    }
  });

  it("returns IndexUnavailable when files are missing", async () => {
    const { getIndex } = await freshLoader(tmp);
    const result = getIndex();
    expect("reason" in result).toBe(true);
  });

  it("returns IndexUnavailable on schema mismatch", async () => {
    writeFileSync(path.join(tmp, "data/_index/index.json"), "[]");
    writeFileSync(path.join(tmp, "data/_index/manifest.json"), JSON.stringify({ ...VALID_MANIFEST, embedding_model: "wrong" }));
    const { getIndex } = await freshLoader(tmp);
    const result = getIndex();
    expect("reason" in result).toBe(true);
  });

  it("caches the loaded index on subsequent calls", async () => {
    writeFileSync(path.join(tmp, "data/_index/index.json"), JSON.stringify([VALID_ENTRY]));
    writeFileSync(path.join(tmp, "data/_index/manifest.json"), JSON.stringify(VALID_MANIFEST));
    const { getIndex } = await freshLoader(tmp);
    const a = getIndex();
    const b = getIndex();
    expect(a).toBe(b);
  });

  it("stays failed after first failure", async () => {
    const { getIndex } = await freshLoader(tmp);
    const a = getIndex();
    const b = getIndex();
    expect("reason" in a).toBe(true);
    expect("reason" in b).toBe(true);
  });
});
