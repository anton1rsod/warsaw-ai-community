import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(__dirname, "../../app/globals.css"), "utf-8");

describe("v0.6 design tokens — globals.css", () => {
  it.each([
    ["--color-cream",      "#fef6e6"],
    ["--color-cream-deep", "#fdebc9"],
    ["--color-ink",        "#1a1a2e"],
    ["--color-dust",       "#886c37"],
    ["--color-paper",      "#ffffff"],
    ["--color-alert",      "#dc1f1f"],
  ])("defines %s as %s", (name, value) => {
    expect(css).toMatch(new RegExp(`${name}\\s*:\\s*${value.replace("#", "#?")}`, "i"));
  });

  it("preserves v0.4 accent ramp (--color-accent-500 = #f59e0b)", () => {
    expect(css).toMatch(/--color-accent-500\s*:\s*#f59e0b/);
  });

  it("body uses cream as canvas (v0.6 ground)", () => {
    expect(css).toMatch(/body\s*\{[^}]*bg-cream/);
  });

  it("includes prefers-reduced-motion override", () => {
    expect(css).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/);
  });
});
