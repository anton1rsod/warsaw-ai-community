// tests/unit/playwright-workers-pin.test.ts
//
// Item C: source-scan regression — assert that playwright.config.ts
// pins workers to 1 both for CI and local runs.
//
// Rationale (R6): the 7 in-memory mock stores live on the single dev-server
// globalThis; running >1 Playwright worker locally races those stores.
// CI was already pinned (workers: 1 when process.env.CI); this asserts the
// local path is pinned too (workers: 1 unconditionally).
//
// Pattern: same source-scan idiom as H122 in this-week-page.test.tsx.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const src = readFileSync(
  resolve(process.cwd(), "playwright.config.ts"),
  "utf8",
);

describe("Item C: playwright.config.ts pins workers to 1 (R6)", () => {
  it("workers is set to 1, not undefined for local runs", () => {
    // Must NOT have the old `process.env.CI ? 1 : undefined` pattern
    expect(src).not.toMatch(/workers\s*:\s*process\.env\.CI\s*\?\s*1\s*:\s*undefined/);
  });

  it("workers is pinned to 1 unconditionally", () => {
    // Must have `workers: 1` as a standalone assignment
    expect(src).toMatch(/workers\s*:\s*1\b/);
  });
});
