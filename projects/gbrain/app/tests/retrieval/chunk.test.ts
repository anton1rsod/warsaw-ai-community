import { describe, it, expect } from "vitest";
import { chunkMarkdown } from "@/retrieval/chunk";

const SAMPLE_FRONTMATTER = `---
author: "@anton"
topic: "Q&A"
timestamp: "2026-04-26T10:00:00Z"
source_link: "https://github.com/x/y/blob/main/z.md"
---

`;

describe("chunkMarkdown", () => {
  it("returns no chunks for an empty body", () => {
    expect(chunkMarkdown(SAMPLE_FRONTMATTER)).toEqual([]);
  });

  it("returns no chunks for a frontmatter-only file", () => {
    expect(chunkMarkdown("---\nfoo: bar\n---\n")).toEqual([]);
  });

  it("produces one chunk for a body under 1920 chars", () => {
    const body = "Hello world. ".repeat(10);
    const chunks = chunkMarkdown(SAMPLE_FRONTMATTER + body);
    expect(chunks.length).toBe(1);
    expect(chunks[0]?.content).toBe(body.trim());
    expect(chunks[0]?.lineRange[0]).toBeGreaterThanOrEqual(1);
    expect(chunks[0]?.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces multiple chunks for a body over 1920 chars", () => {
    const para = "x".repeat(1000) + " ";
    const body = para.repeat(3);
    const chunks = chunkMarkdown(SAMPLE_FRONTMATTER + body);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });

  it("is deterministic — same input produces identical hashes", () => {
    const body = "consistent content".repeat(10);
    const a = chunkMarkdown(SAMPLE_FRONTMATTER + body);
    const b = chunkMarkdown(SAMPLE_FRONTMATTER + body);
    expect(a.map(c => c.hash)).toEqual(b.map(c => c.hash));
  });

  it("trims whitespace before hashing", () => {
    const body = "abc";
    const a = chunkMarkdown(SAMPLE_FRONTMATTER + "  " + body + "  ");
    const b = chunkMarkdown(SAMPLE_FRONTMATTER + body);
    expect(a[0]?.hash).toBe(b[0]?.hash);
  });
});
