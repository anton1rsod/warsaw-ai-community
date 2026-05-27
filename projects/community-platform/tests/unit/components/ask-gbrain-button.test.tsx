import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const src = readFileSync(
  resolve(__dirname, "../../../app/components/AskGBrainButton.tsx"),
  "utf8",
);

describe("AskGBrainButton v0.9 — warm, no dark:/scaffolding (H99)", () => {
  it("no dark:", () => { expect(src).not.toMatch(/\bdark:/); });
  it("no neutral-/gray-", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("no rounded", () => { expect(src).not.toMatch(/\brounded\b/); });
  it("uses Pill component", () => { expect(src).toMatch(/Pill/); });
});
