import { describe, expect, it } from "vitest";
import { parseMarkdown, renderMarkdownToHtml, truncateToFirstH2 } from "@/lib/markdown";

describe("parseMarkdown", () => {
  it("extracts frontmatter and body", () => {
    const src = `---\nname: Alice\nrole: member\n---\n\n# Hello\n\nBody.`;
    const result = parseMarkdown(src);
    expect(result.data.name).toBe("Alice");
    expect(result.body).toContain("# Hello");
  });

  it("handles missing frontmatter", () => {
    const result = parseMarkdown(`# Just body`);
    expect(result.data).toEqual({});
    expect(result.body).toBe("# Just body");
  });
});

describe("renderMarkdownToHtml", () => {
  it("renders headings, paragraphs, and links", async () => {
    const html = await renderMarkdownToHtml(`# Title\n\nA [link](https://example.com).`);
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain('<a href="https://example.com">link</a>');
  });

  it("supports GFM tables", async () => {
    const html = await renderMarkdownToHtml(`| a | b |\n|---|---|\n| 1 | 2 |\n`);
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });

  it("strips raw HTML script tags from input (sanitization)", async () => {
    const malicious = `# Hi\n\n<script>alert('xss')</script>\n\nText.`;
    const html = await renderMarkdownToHtml(malicious);
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert");
  });

  it("strips event-handler attributes (sanitization)", async () => {
    const malicious = `<img src="x" onerror="alert(1)">`;
    const html = await renderMarkdownToHtml(malicious);
    expect(html).not.toContain("onerror");
  });
});

describe("truncateToFirstH2", () => {
  it("returns content up to (not including) the first H2", () => {
    const src = `# H1\n\nIntro.\n\n## Section A\n\nThis is cut.`;
    expect(truncateToFirstH2(src)).toBe("# H1\n\nIntro.\n");
  });

  it("returns full content if no H2", () => {
    const src = `# H1\n\nOnly H1.`;
    expect(truncateToFirstH2(src)).toBe(src);
  });
});
