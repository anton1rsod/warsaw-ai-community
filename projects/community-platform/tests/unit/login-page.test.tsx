import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("/login v0.9 — warm, AA-safe CTA, no dark:/scaffolding", () => {
  const page = readFileSync(resolve(__dirname, "../../app/login/page.tsx"), "utf8");
  const form = readFileSync(resolve(__dirname, "../../app/login/LoginForm.tsx"), "utf8");
  const both = page + "\n" + form;
  it("uses no Tailwind dark: variants", () => { expect(both).not.toMatch(/\bdark:/); });
  it("uses no neutral-/gray- scale", () => {
    expect(both).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(both).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("does NOT use text-white on the CTA (v0.4 AA failure: text-white on bg-accent-500 ~1.88:1)", () => {
    expect(both).not.toMatch(/text-white/);
  });
  it("uses warm tokens (font-display / ink / cream)", () => {
    expect(both).toMatch(/font-display/);
    expect(both).toMatch(/text-ink|text-dust|text-cream|bg-ink/);
  });
});
