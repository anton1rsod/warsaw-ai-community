import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const src = readFileSync(
  resolve(__dirname, "../../app/members/[slug]/page.tsx"),
  "utf8",
);

describe("member detail page v0.9 — warm, no dark:/scaffolding (H99)", () => {
  it("no dark:", () => { expect(src).not.toMatch(/\bdark:/); });
  it("no neutral-/gray-", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("no rounded", () => { expect(src).not.toMatch(/\brounded\b/); });
  it("recipe tokens present", () => {
    expect(src).toMatch(/font-display/);
    expect(src).toMatch(/text-ink|text-dust/);
  });
  it("prose-warm present (for bio)", () => { expect(src).toMatch(/prose-warm/); });
  it("prose-neutral absent", () => { expect(src).not.toMatch(/prose-neutral/); });
  it("dark:prose-invert absent", () => { expect(src).not.toMatch(/dark:prose-invert/); });
});
