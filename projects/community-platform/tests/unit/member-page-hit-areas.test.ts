import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * H159 / SC 2.5.8 — every standalone action target on the dossier surfaces
 * (anchor, Link, summary, button) carries a ≥24px box via min-h-[24px] +
 * padding-block. Count-based: sized-class occurrences must cover every
 * target tag in the file. (Viewport-box verification at 375/1280 happens in
 * the Playwright ship smoke; this pins the classes at unit level.)
 */
const FILES = [
  "../../app/members/[slug]/page.tsx",
  "../../app/components/FirstQuestionQuote.tsx",
  "../../app/components/StorySection.tsx",
  "../../app/components/ActivityLine.tsx",
  "../../app/components/CopyHandle.tsx",
];

describe("H159 — 24px hit areas on dossier action links", () => {
  for (const rel of FILES) {
    it(`${rel.split("/").pop()}: every <a|Link|summary|button> has a min-h-[24px] box`, () => {
      const src = readFileSync(resolve(__dirname, rel), "utf8");
      const targets = (src.match(/<(a|Link|summary|button)[\s>]/g) ?? []).length;
      const sized = (src.match(/min-h-\[24px\]/g) ?? []).length;
      expect(targets).toBeGreaterThan(0);
      expect(sized).toBeGreaterThanOrEqual(targets);
      expect(src).toMatch(/py-(1|3)/); // padding-block, not visual-size change
    });
  }
});
