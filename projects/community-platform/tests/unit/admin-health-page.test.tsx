import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("/admin/health page v0.9.1 — warm, no dark:/scaffolding", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/admin/health/page.tsx"),
    "utf8",
  );

  it("no dark:", () => expect(src).not.toMatch(/\bdark:/));
  it("no neutral-*/gray-*", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("no rounded border (scaffolding)", () =>
    expect(src).not.toMatch(/\brounded border\b/));
  it("no standalone rounded", () => expect(src).not.toMatch(/\brounded\b/));
  it("C9 tile: border-l-[3px] border-l-ink", () =>
    expect(src).toMatch(/border-l-\[3px\] border-l-ink/));
  it("C9 number: tabular-nums", () => expect(src).toMatch(/tabular-nums/));
  it("recipe tokens: font-display + text-ink/text-dust", () => {
    expect(src).toMatch(/font-display/);
    expect(src).toMatch(/text-ink|text-dust/);
  });
});
