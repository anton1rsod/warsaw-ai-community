import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { describe, it, expect } from "vitest";

const COMPONENTS_DIR = resolve(__dirname, "../../app/components");
const PAGE = resolve(__dirname, "../../app/members/[slug]/page.tsx");
const componentFiles = readdirSync(COMPONENTS_DIR).filter((f) => f.endsWith(".tsx"));

describe("H158 — <details>/<summary> constraints (spec §3 a11y, WebKit-verified)", () => {
  it("no display:contents (style or Tailwind class) in app/components or the member page", () => {
    const sources = [
      ...componentFiles.map((f) => [f, readFileSync(join(COMPONENTS_DIR, f), "utf8")] as const),
      ["members/[slug]/page.tsx", readFileSync(PAGE, "utf8")] as const,
    ];
    for (const [name, src] of sources) {
      expect(src, name).not.toMatch(/display:\s*contents/);
      expect(src, name).not.toMatch(/className="[^"]*(?:^|\s)contents(?:\s|")/);
    }
  });

  for (const f of componentFiles) {
    const src = readFileSync(join(COMPONENTS_DIR, f), "utf8");
    if (!src.includes("<details")) continue;

    it(`${f}: summaries hide the native marker (list-none + ::-webkit-details-marker)`, () => {
      expect(src).toMatch(/list-none/);
      expect(src).toMatch(/\[&::-webkit-details-marker\]:hidden/);
    });

    it(`${f}: no heading elements inside <summary>`, () => {
      const blocks = src.match(/<summary[\s\S]*?<\/summary>/g) ?? [];
      expect(blocks.length).toBeGreaterThan(0);
      for (const b of blocks) {
        expect(b).not.toMatch(/<h[1-6][\s>]/);
      }
    });

    it(`${f}: caret glyph is aria-hidden`, () => {
      const idx = src.indexOf("▾");
      expect(idx).toBeGreaterThan(-1);
      const windowBefore = src.slice(Math.max(0, idx - 200), idx);
      expect(windowBefore).toMatch(/aria-hidden="true"/);
    });
  }
});
