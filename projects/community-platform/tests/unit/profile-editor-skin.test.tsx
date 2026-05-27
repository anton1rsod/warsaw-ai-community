import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("ProfileEditor v0.9.1 — warm tokens, no scaffolding (C7/H105/H108)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/components/ProfileEditor.tsx"),
    "utf8",
  );

  it("no neutral-*/gray-* tokens", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });

  it("no rounded scaffolding", () => {
    expect(src).not.toMatch(/\brounded\b/);
  });

  it("no amber-200/amber-50 scaffolding", () => {
    expect(src).not.toMatch(/\bamber-200\b/);
    expect(src).not.toMatch(/\bamber-50\b/);
  });

  it("no text-red- tokens", () => {
    expect(src).not.toMatch(/\btext-red-/);
  });

  it("uses prose-warm (not prose-neutral)", () => {
    expect(src).toMatch(/prose-warm/);
    expect(src).not.toMatch(/prose prose-neutral/);
  });

  it("imports Pill from @/app/components/Pill", () => {
    expect(src).toMatch(/from "@\/app\/components\/Pill"/);
  });

  it("uses bg-cream-deep for input fields", () => {
    expect(src).toMatch(/bg-cream-deep/);
  });

  it("no dark: variants", () => {
    expect(src).not.toMatch(/\bdark:/);
  });
});
