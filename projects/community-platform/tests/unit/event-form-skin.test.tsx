import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("EventForm v0.9.1 — warm, no dark:/scaffolding", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/components/EventForm.tsx"),
    "utf8",
  );

  it("no dark:", () => expect(src).not.toMatch(/\bdark:/));
  it("no neutral-*", () => expect(src).not.toMatch(/\b(text|bg|border)-neutral-/));
  it("no gray-*", () => expect(src).not.toMatch(/\b(text|bg|border)-gray-/));
  it("no rounded", () => expect(src).not.toMatch(/\brounded\b/));
  it("fields use bg-cream-deep", () => expect(src).toMatch(/bg-cream-deep/));
  it("imports Pill", () =>
    expect(src).toMatch(/from "@\/app\/components\/Pill"/));
  it("preview uses prose-warm not prose prose-sm", () =>
    expect(src).not.toMatch(/prose prose-/));
  it("preview has prose-warm", () => expect(src).toMatch(/prose-warm/));
});
