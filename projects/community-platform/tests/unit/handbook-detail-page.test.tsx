import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const src = readFileSync(
  resolve(__dirname, "../../app/handbook/page.tsx"),
  "utf8",
);

describe("handbook page v0.9 — warm, no dark:/scaffolding (H99)", () => {
  it("no dark:", () => { expect(src).not.toMatch(/\bdark:/); });
  it("no neutral-/gray-", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("no rounded", () => { expect(src).not.toMatch(/\brounded\b/); });
  it("section links tokenized (font-voice or font-display)", () => {
    expect(src).toMatch(/font-voice|font-display/);
  });
  it("FormalEntityMasthead preserved", () => {
    expect(src).toMatch(/FormalEntityMasthead/);
  });
  it("no accent misuse (accent only on action links)", () => {
    // accent-700 used on links is acceptable per spec, but accent misuse on
    // backgrounds is not. We verify no accent-50/500/600/900 on bg/border.
    expect(src).not.toMatch(/\b(bg|border)-accent-/);
  });
});
