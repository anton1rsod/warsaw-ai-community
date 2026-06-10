import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * H156 — pair-contrast regression (v0.12 spec §3 + §23).
 *
 * Contrast is pinned per (foreground × background) PAIR, not per token:
 * dust passes AA on cream (4.60:1) but FAILS on surface-soft (4.42:1);
 * accent-700 passes AA on cream (4.67:1) but is sub-AA text on surface-soft
 * (4.49:1). Tinted surfaces must use ink-muted — the only muted tone safe on
 * ALL page surfaces. The focus ring (accent-700) needs only the non-text 3:1
 * (SC 1.4.11) on every surface it can appear over.
 *
 * Hex values are extracted from the literal `--color-*` declarations in
 * app/globals.css so any token retune re-runs the math automatically.
 */

const css = readFileSync(resolve(__dirname, "../../app/globals.css"), "utf8");

function tokenHex(name: string): string {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
  const hex = m?.[1];
  if (!hex) throw new Error(`--color-${name} not found in app/globals.css`);
  return hex;
}

/** WCAG 2.x relative luminance (sRGB linearization). */
function luminance(hex: string): number {
  const channel = (slice: string): number => {
    const v = parseInt(slice, 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(hex.slice(1, 3)) +
    0.7152 * channel(hex.slice(3, 5)) +
    0.0722 * channel(hex.slice(5, 7))
  );
}

/** WCAG contrast ratio: (L_lighter + 0.05) / (L_darker + 0.05). */
function contrastRatio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("H156: pair-contrast regression — WCAG ratios from globals.css literals", () => {
  it.each([
    // [foreground, background, minimum, rationale]
    ["ink-muted", "cream", 4.5, "secondary text on canvas (AA)"],
    ["ink-muted", "surface-soft", 4.5, "secondary text on lens band / summary hover (AA)"],
    ["dust", "cream", 4.5, "mono kickers + small muted text on cream ONLY (AA)"],
    ["accent-700", "cream", 4.5, "link color on cream (AA)"],
    ["accent-700", "cream", 3, "focus ring on cream (SC 1.4.11 non-text)"],
    ["accent-700", "surface-soft", 3, "focus ring on lens band (SC 1.4.11 non-text)"],
    ["accent-700", "cream-deep", 3, "focus ring over avatar/deep panel (SC 1.4.11 non-text)"],
  ] as const)("%s on %s ≥ %s:1 (%s)", (fg, bg, min) => {
    expect(contrastRatio(tokenHex(fg), tokenHex(bg))).toBeGreaterThanOrEqual(min);
  });
});
