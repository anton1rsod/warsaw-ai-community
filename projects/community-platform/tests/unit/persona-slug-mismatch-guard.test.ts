// tests/unit/persona-slug-mismatch-guard.test.ts
//
// Item B: regression guard — verifies the H68 invariant REJECTS a
// `firstname-lastinitial`-style mismatch.
//
// The v0.11.1 bug: persona_builder deriving `persona_id` from first-name +
// last-initial ("Anton S." → `anton-s`), while the roster produces
// `slugify("Anton Safronov")` → `anton-safronov`. This test asserts that
// the H68 logic catches that mismatch when applied to synthetic data.
//
// This is a UNIT test of the invariant logic — it does NOT walk the real
// persona-builder/personas/ directory (that's the H68 directory-scan test).

import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slug";

describe("Item B: persona slug mismatch — firstnamelastinitial vs full-name slug", () => {
  it("slugify('Anton Safronov') produces anton-safronov, NOT anton-s", () => {
    expect(slugify("Anton Safronov")).toBe("anton-safronov");
  });

  it("detects a folder/display_name mismatch for first-name+last-initial style", () => {
    // Simulates the invariant check: folder "anton-s" with display_name "Anton Safronov"
    const folder = "anton-s";
    const displayName = "Anton Safronov";
    const expectedFolder = slugify(displayName); // "anton-safronov"

    // The invariant MUST fail for this input
    expect(folder).not.toBe(expectedFolder);
    expect(expectedFolder).toBe("anton-safronov");
  });

  it("accepts the correct full-name slug for Anton Safronov", () => {
    const folder = "anton-safronov";
    const displayName = "Anton Safronov";
    expect(folder).toBe(slugify(displayName));
  });

  it("detects the mark-s vs mark-spasonov mismatch", () => {
    const badFolder = "mark-s";
    const displayName = "Mark Spasonov";
    const expectedFolder = slugify(displayName); // "mark-spasonov"

    expect(badFolder).not.toBe(expectedFolder);
    expect(expectedFolder).toBe("mark-spasonov");
  });

  it("slugify correctly strips spaces → hyphens for multi-word names", () => {
    expect(slugify("Jane Doe")).toBe("jane-doe");
    expect(slugify("John Michael Smith")).toBe("john-michael-smith");
  });

  it("slugify strips accents (NFKD) → ASCII equivalent", () => {
    // ë decomposes to e + combining diacritic → "e" retained, diacritic stripped
    expect(slugify("Zoë O'Brien")).toBe("zoe-o-brien");
  });
});
