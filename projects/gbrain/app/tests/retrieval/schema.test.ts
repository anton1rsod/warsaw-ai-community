import { describe, it, expect } from "vitest";
import { IndexEntrySchema, ManifestSchema, IndexFileSchema } from "@/retrieval/schema";

describe("IndexEntrySchema", () => {
  it("accepts a valid entry with 768-dim embedding", () => {
    const entry = {
      id: "a".repeat(64),
      source_path: "community/archive/2026-04/foo.md",
      source_lines: [1, 30] as [number, number],
      chunk_hash: "b".repeat(64),
      embedding: Array.from({ length: 768 }, () => 0),
      content_preview: "preview",
      metadata: {
        author_handle: "@anton",
        topic: "Q&A",
        timestamp_iso: "2026-04-26T10:00:00Z",
        source_link: "https://github.com/o/r/blob/main/x.md#L1-L30"
      }
    };
    expect(() => IndexEntrySchema.parse(entry)).not.toThrow();
  });

  it("rejects an embedding with the wrong length", () => {
    const entry = {
      id: "a".repeat(64),
      source_path: "x.md",
      source_lines: [1, 30] as [number, number],
      chunk_hash: "b".repeat(64),
      embedding: Array.from({ length: 5 }, () => 0),
      content_preview: "p",
      metadata: { author_handle: "@a", topic: "t", timestamp_iso: "2026-04-26T10:00:00Z", source_link: "https://x.com" }
    };
    expect(() => IndexEntrySchema.parse(entry)).toThrow();
  });

  it("rejects an id that's not 64-hex", () => {
    const entry = {
      id: "not-hex",
      source_path: "x.md",
      source_lines: [1, 30] as [number, number],
      chunk_hash: "b".repeat(64),
      embedding: Array.from({ length: 768 }, () => 0),
      content_preview: "p",
      metadata: { author_handle: "@a", topic: "t", timestamp_iso: "2026-04-26T10:00:00Z", source_link: "https://x.com" }
    };
    expect(() => IndexEntrySchema.parse(entry)).toThrow();
  });
});

describe("ManifestSchema", () => {
  it("accepts a valid manifest with locked literals", () => {
    const m = {
      built_at: "2026-04-26T10:00:00Z",
      built_by_workflow: "build-index.yml#42",
      embedding_model: "gemini-embedding-001",
      embedding_dim: 768,
      source_files_hash: "c".repeat(64),
      schema_version: 1,
      stats: {
        total_chunks: 0,
        total_source_files: 0,
        total_embeddings_generated_this_run: 0,
        total_embeddings_reused_this_run: 0,
        total_embeddings_failed_this_run: 0,
        embed_failed_chunks: [],
        build_ms: 100
      }
    };
    expect(() => ManifestSchema.parse(m)).not.toThrow();
  });

  it("rejects a manifest with an unexpected embedding_model", () => {
    const m = {
      built_at: "2026-04-26T10:00:00Z",
      built_by_workflow: "x",
      embedding_model: "text-embedding-004",
      embedding_dim: 768,
      source_files_hash: "c".repeat(64),
      schema_version: 1,
      stats: { total_chunks: 0, total_source_files: 0, total_embeddings_generated_this_run: 0, total_embeddings_reused_this_run: 0, total_embeddings_failed_this_run: 0, embed_failed_chunks: [], build_ms: 0 }
    };
    expect(() => ManifestSchema.parse(m)).toThrow();
  });
});

describe("IndexFileSchema", () => {
  it("accepts an empty array", () => {
    expect(() => IndexFileSchema.parse([])).not.toThrow();
  });
});
