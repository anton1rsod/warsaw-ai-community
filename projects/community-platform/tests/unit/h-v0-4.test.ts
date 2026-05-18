import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("H64: token variable contract (globals.css)", () => {
  const css = readFileSync(
    join(process.cwd(), "app", "globals.css"),
    "utf-8",
  );

  it("declares the canonical accent ramp at :root", () => {
    expect(css).toMatch(/--color-accent-50:\s*#fffbeb/);
    expect(css).toMatch(/--color-accent-100:\s*#fef3c7/);
    expect(css).toMatch(/--color-accent-500:\s*#f59e0b/);
    expect(css).toMatch(/--color-accent-600:\s*#d97706/);
    expect(css).toMatch(/--color-accent-700:\s*#b45309/);
    expect(css).toMatch(/--color-accent-900:\s*#78350f/);
  });

  it("declares the neutral ramp slot (foundation for v0.5+ dark mode)", () => {
    expect(css).toMatch(/--color-neutral-50:\s*#fafafa/);
    expect(css).toMatch(/--color-neutral-900:\s*#171717/);
  });

  it("uses `--color-<role>-<weight>` naming convention only", () => {
    const varDecls = Array.from(css.matchAll(/--color-([a-z]+)-(\d+):/g));
    expect(varDecls.length).toBeGreaterThan(0);
    for (const [, role, weight] of varDecls) {
      expect(role).toMatch(/^(accent|neutral)$/);
      expect(Number(weight)).toBeGreaterThanOrEqual(50);
      expect(Number(weight)).toBeLessThanOrEqual(900);
    }
  });

  it("includes the comment legend documenting the contract", () => {
    expect(css).toMatch(/--color-<role>-<weight>/);
  });
});
