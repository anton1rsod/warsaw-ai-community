import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const PAGES = ["calendar","decisions","meetings","members","this-week","handbook","projects"];
describe("H103: reader recipe a11y invariant", () => {
  for (const p of PAGES) {
    it(`${p} has one <main id="main"> and one <h1>`, () => {
      const src = readFileSync(resolve(__dirname, `../../app/${p}/page.tsx`), "utf8");
      expect((src.match(/id="main"/g) ?? []).length).toBe(1);
      expect((src.match(/<h1/g) ?? []).length).toBe(1);
    });
  }
});
