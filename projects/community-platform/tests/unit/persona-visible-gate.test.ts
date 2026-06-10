/**
 * H147 regression: persona_visible gate must remain in /members/[slug]/page.tsx.
 *
 * Source-scan approach (project convention — see no-dark-variants.test.ts).
 * Guards against the gate being removed from the member-detail page.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const PAGE_PATH = resolve(
  __dirname,
  "../../app/members/[slug]/page.tsx",
);

const src = readFileSync(PAGE_PATH, "utf8");

describe("H147: persona_visible gate in /members/[slug]/page.tsx", () => {
  it("contains the personaVisible ternary that gates the persona prop", () => {
    // The gate expression: personaVisible ? parsedPersona : null
    expect(src).toMatch(/personaVisible\s*\?\s*parsedPersona\s*:\s*null/);
  });

  it("derives personaVisible from fm?.persona_visible without a type cast", () => {
    // Must use fm?.persona_visible (no `as` cast after Phase 4 cleanup).
    expect(src).toMatch(/fm\?\.persona_visible\s*!==\s*false/);
    // Confirm the old cast is gone.
    expect(src).not.toMatch(/as\s*\{\s*persona_visible/);
  });
});
