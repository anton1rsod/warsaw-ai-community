import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("/admin/events/new page v0.9.1 — warm, no dark:/scaffolding", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/admin/events/new/page.tsx"),
    "utf8",
  );

  it("no dark:", () => expect(src).not.toMatch(/\bdark:/));
  it("no neutral-*/gray-*", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("no rounded", () => expect(src).not.toMatch(/\brounded\b/));
  it("recipe tokens: font-display + text-ink/text-dust", () => {
    expect(src).toMatch(/font-display/);
    expect(src).toMatch(/text-ink|text-dust/);
  });
});
