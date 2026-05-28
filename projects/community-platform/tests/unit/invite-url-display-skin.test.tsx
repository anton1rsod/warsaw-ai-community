import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("InviteUrlDisplay v0.9.1 — warm, no dark:/scaffolding", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/components/InviteUrlDisplay.tsx"),
    "utf8",
  );

  it("no dark:", () => expect(src).not.toMatch(/\bdark:/));
  it("no neutral-*/gray-*", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("no rounded", () => expect(src).not.toMatch(/\brounded\b/));
  it("result panel uses bg-cream-deep", () =>
    expect(src).toMatch(/bg-cream-deep/));
  it("imports Pill", () =>
    expect(src).toMatch(/from "@\/app\/components\/Pill"/));
});
