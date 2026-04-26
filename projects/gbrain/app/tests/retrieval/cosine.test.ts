import { describe, it, expect } from "vitest";
import { cosineSimilarity, topK } from "@/retrieval/cosine";
import type { IndexEntry } from "@/retrieval/schema";

const make = (id: string, embedding: number[]): IndexEntry => ({
  id: id.padEnd(64, "0"),
  source_path: `${id}.md`,
  source_lines: [1, 1],
  chunk_hash: id.padEnd(64, "f"),
  embedding,
  content_preview: id,
  metadata: { author_handle: "@x", topic: "t", timestamp_iso: "2026-04-26T00:00:00Z", source_link: "https://x.com" }
});

describe("cosineSimilarity", () => {
  it("returns 1.0 for identical unit vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1.0, 5);
  });
  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0, 5);
  });
  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [-1, 0, 0])).toBeCloseTo(-1, 5);
  });
  it("returns 0 when either vector is zero", () => {
    expect(cosineSimilarity([0, 0, 0], [1, 1, 1])).toBe(0);
  });
});

describe("topK", () => {
  const a = make("a", [1, 0, 0]);
  const b = make("b", [0.9, 0.1, 0]);
  const c = make("c", [0.5, 0.5, 0]);
  const d = make("d", [0, 1, 0]);

  it("returns at most K results, ranked by similarity descending", () => {
    const results = topK([1, 0, 0], [a, b, c, d], 2);
    expect(results.length).toBe(2);
    expect(results[0]?.entry.id).toBe(a.id);
    expect(results[1]?.entry.id).toBe(b.id);
  });

  it("breaks ties deterministically by chunk id", () => {
    const x = make("xxxxxxxxxx", [1, 0, 0]);
    const y = make("yyyyyyyyyy", [1, 0, 0]);
    const r = topK([1, 0, 0], [y, x], 2);
    expect((r[0]?.entry.id ?? "") < (r[1]?.entry.id ?? "")).toBe(true);
  });

  it("returns empty array for empty index", () => {
    expect(topK([1, 0, 0], [], 5)).toEqual([]);
  });
});
