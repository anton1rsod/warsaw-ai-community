import { describe, it, expect } from "vitest";
import { renderAskPrompt } from "@/prompts/ask";

describe("renderAskPrompt", () => {
  const ctx = {
    excerpts: [
      { id: 1, sourcePath: "a.md", lineStart: 1, lineEnd: 5, authorHandle: "@x", date: "2026-04-26", topic: "Q&A", content: "Foo." },
      { id: 2, sourcePath: "b.md", lineStart: 1, lineEnd: 5, authorHandle: "@y", date: "2026-04-25", topic: "Builds", content: "Bar." }
    ],
    question: "What is foo?"
  };

  it("contains both INJECTION GUARD blocks", () => {
    const p = renderAskPrompt(ctx);
    expect(p).toMatch(/INJECTION GUARD\s*[—\-]\s*ARCHIVE CONTENT/i);
    expect(p).toMatch(/INJECTION GUARD\s*[—\-]\s*USER QUESTION/i);
  });

  it("wraps each excerpt in <excerpt id=N> with metadata", () => {
    const p = renderAskPrompt(ctx);
    expect(p).toContain('<excerpt id="1"');
    expect(p).toContain('<excerpt id="2"');
    expect(p).toContain('source="a.md"');
  });

  it("wraps the question in <question>...</question>", () => {
    const p = renderAskPrompt(ctx);
    expect(p).toContain("<question>\nWhat is foo?\n</question>");
  });

  it("has exactly one <excerpts> open and close tag", () => {
    const p = renderAskPrompt(ctx);
    const opens = (p.match(/<excerpts>/g) ?? []).length;
    const closes = (p.match(/<\/excerpts>/g) ?? []).length;
    expect(opens).toBe(1);
    expect(closes).toBe(1);
  });

  it("instructs use of <citation id=N/> markers", () => {
    const p = renderAskPrompt(ctx);
    expect(p).toContain('<citation id="N"/>');
  });

  it("includes the no-answer fallback string", () => {
    const p = renderAskPrompt(ctx);
    expect(p).toContain("I can't answer this from the current archive.");
  });

  it("includes the chunk content literally", () => {
    const p = renderAskPrompt(ctx);
    expect(p).toContain("Foo.");
    expect(p).toContain("Bar.");
  });
});
