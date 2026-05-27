import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("v0.9 .prose-warm — tokenized markdown styling (no typography plugin)", () => {
  const css = readFileSync(resolve(__dirname, "../../app/globals.css"), "utf8");
  it("defines .prose-warm in a components layer", () => {
    expect(css).toMatch(/\.prose-warm\b/);
  });
  it("styles headings with font-display and body with ink", () => {
    expect(css).toMatch(/\.prose-warm\s+:where\((h1|h2|h3)/);
  });
  it("contains wide code blocks: <pre> scrolls horizontally instead of overflowing the page", () => {
    expect(css).toMatch(/\.prose-warm\s+:where\(pre\)\s*\{[^}]*overflow-x-auto/);
  });
});
