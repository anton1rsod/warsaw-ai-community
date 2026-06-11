import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import config from "../../tailwind.config";

/**
 * v0.12 typeset-dossier tokens (spec §3) — source-scan.
 *
 * 1. globals.css :root defines the warm-ladder vars at the pinned hexes
 *    (the contrast math for these literals lives in contrast-pairs.test.ts).
 * 2. tailwind.config.ts wires each var to a utility color token.
 * 3. The global :focus-visible ring flips accent-500 → accent-700 (H156):
 *    raw amber #f59e0b measures 2.0:1 on cream and fails SC 1.4.11
 *    (non-text 3:1). Platform-wide flip.
 */

const css = readFileSync(resolve(__dirname, "../../app/globals.css"), "utf8");

describe("v0.12 design tokens — globals.css", () => {
  it.each([
    ["--color-ink-body", "#3c3a47"],
    ["--color-ink-muted", "#6e6757"],
    ["--color-hairline", "#f1e4c8"],
    ["--color-hairline-strong", "#e3d2ac"],
    ["--color-surface-soft", "#fdf1d9"],
  ])("defines %s as %s", (name, value) => {
    expect(css).toMatch(new RegExp(`${name}:\\s*${value}`, "i"));
  });

  it("H156: global :focus-visible ring uses accent-700 (not accent-500)", () => {
    const block = css.match(/:focus-visible\s*\{[^}]*\}/)?.[0] ?? "";
    expect(block).toContain("var(--color-accent-700)");
    expect(block).not.toContain("var(--color-accent-500)");
  });
});

describe("v0.12 design tokens — tailwind.config.ts", () => {
  it("extends colors with the warm-ladder tokens mapped to CSS vars", () => {
    const colors = config.theme?.extend?.colors as Record<
      string,
      string | Record<string, string>
    >;
    expect(colors["ink-body"]).toBe("var(--color-ink-body)");
    expect(colors["ink-muted"]).toBe("var(--color-ink-muted)");
    expect(colors.hairline).toBe("var(--color-hairline)");
    expect(colors["hairline-strong"]).toBe("var(--color-hairline-strong)");
    expect(colors["surface-soft"]).toBe("var(--color-surface-soft)");
  });
});
