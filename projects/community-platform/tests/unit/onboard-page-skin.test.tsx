import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("/onboard page v0.9.1 — warm, no dark:/scaffolding (C4/H105)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/onboard/page.tsx"),
    "utf8",
  );

  it("no dark: variants", () => expect(src).not.toMatch(/\bdark:/));

  it("no neutral-*/gray-*", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });

  it("no rounded scaffolding", () => expect(src).not.toMatch(/\brounded\b/));

  it("uses recipe tokens", () => {
    expect(src).toMatch(/font-display/);
    expect(src).toMatch(/text-ink|text-dust/);
  });
});

describe("/onboard/error page v0.9.1 — warm, no dark:/scaffolding (C4/H105)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/onboard/error/page.tsx"),
    "utf8",
  );

  it("no dark: variants", () => expect(src).not.toMatch(/\bdark:/));

  it("no neutral-*/gray-*", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });

  it("no rounded scaffolding", () => expect(src).not.toMatch(/\brounded\b/));

  it("uses recipe tokens", () => {
    expect(src).toMatch(/font-display/);
    expect(src).toMatch(/text-ink|text-dust/);
  });
});
