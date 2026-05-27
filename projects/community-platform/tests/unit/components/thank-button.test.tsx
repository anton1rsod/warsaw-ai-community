import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const src = readFileSync(
  resolve(__dirname, "../../../app/components/ThankButton.tsx"),
  "utf8",
);

describe("ThankButton v0.9 — warm, no dark:/scaffolding (H99, H101)", () => {
  it("no dark:", () => { expect(src).not.toMatch(/\bdark:/); });
  it("no neutral-/gray-", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("no rounded-full or rounded-* scaffolding", () => { expect(src).not.toMatch(/\brounded\b/); });
  it("meets H101 min-h-24px or built on Pill", () => {
    const hasMinH = src.includes("min-h-[24px]");
    const hasPill = src.includes("Pill");
    expect(hasMinH || hasPill).toBe(true);
  });
});
