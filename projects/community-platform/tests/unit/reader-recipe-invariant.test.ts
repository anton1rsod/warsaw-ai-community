import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const PAGES = [
  "calendar","decisions","meetings","members","this-week","handbook","projects",
  // v0.9.1 form/admin pages that gained the recipe shell:
  "me/edit","no-access","admin/health","admin/invite","admin/events/new","onboard/error",
  // NOTE: "onboard" (app/onboard/page.tsx) is intentionally excluded — it has TWO render
  // branches (signed-out signin + signed-in form), each with its own <main id="main"> + <h1>.
  // Source-scan would count 2 for both and fail. At runtime only one branch renders so it
  // is not a real a11y issue. Add it here only if the test is refactored to render-based.
];
describe("H103: reader recipe a11y invariant", () => {
  for (const p of PAGES) {
    it(`${p} has one <main id="main"> and one <h1>`, () => {
      const src = readFileSync(resolve(__dirname, `../../app/${p}/page.tsx`), "utf8");
      expect((src.match(/id="main"/g) ?? []).length).toBe(1);
      expect((src.match(/<h1/g) ?? []).length).toBe(1);
    });
  }
});
