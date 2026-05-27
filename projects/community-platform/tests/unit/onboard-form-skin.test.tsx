import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("OnboardForm v0.9.1 — warm tokens, no scaffolding (C7/H105)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/components/OnboardForm.tsx"),
    "utf8",
  );

  it("no neutral-*/gray-* tokens", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });

  it("no rounded scaffolding", () => {
    expect(src).not.toMatch(/\brounded\b/);
  });

  it("uses bg-cream-deep for input fields", () => {
    expect(src).toMatch(/bg-cream-deep/);
  });

  it("imports Pill from @/app/components/Pill", () => {
    expect(src).toMatch(/from "@\/app\/components\/Pill"/);
  });

  it("no dark: variants", () => {
    expect(src).not.toMatch(/\bdark:/);
  });
});
