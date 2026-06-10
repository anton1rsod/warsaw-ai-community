import { describe, expect, it } from "vitest";
import { overlapHasContent } from "@/lib/persona-overlap";
import type { OverlapResult } from "@/lib/persona-overlap";

const EMPTY: OverlapResult = { shared: [], complementary: [], starters: [] };
const TAG = {
  label: "fintech",
  viewerDepth: "practitioner",
  subjectDepth: "expert",
} as const;

describe("overlapHasContent (Phase 3 render gate)", () => {
  it("false when all three lists are empty", () => {
    expect(overlapHasContent(EMPTY)).toBe(false);
  });
  it("true when only shared has entries", () => {
    expect(overlapHasContent({ ...EMPTY, shared: [TAG] })).toBe(true);
  });
  it("true when only complementary has entries", () => {
    expect(overlapHasContent({ ...EMPTY, complementary: [TAG] })).toBe(true);
  });
  it("true when only starters has entries", () => {
    expect(
      overlapHasContent({
        ...EMPTY,
        starters: ["Their niche: x — ask how they got there."],
      }),
    ).toBe(true);
  });
});
