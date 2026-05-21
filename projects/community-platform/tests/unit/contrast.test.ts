import { describe, it, expect } from "vitest";

function relLum(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const c = (v: number): number =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
}

function contrast(a: string, b: string): number {
  const la = relLum(a);
  const lb = relLum(b);
  const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

const TOKENS = {
  cream: "#fef6e6",
  creamDeep: "#fdebc9",
  ink: "#1a1a2e",
  amber: "#f59e0b",
  dust: "#886c37",
  paper: "#ffffff",
} as const;

type TokenName = keyof typeof TOKENS;

describe("H92: WCAG AA 4.5:1 on v0.6 token pairs", () => {
  it.each<[TokenName, TokenName, number]>([
    ["ink", "cream", 4.5],
    ["ink", "creamDeep", 4.5],
    ["ink", "paper", 4.5],
    ["ink", "amber", 4.5],
    ["cream", "ink", 4.5],
    ["dust", "cream", 4.5],
  ])("contrast(%s on %s) >= %s", (fg, bg, min) => {
    const ratio = contrast(TOKENS[fg], TOKENS[bg]);
    expect(
      ratio,
      `contrast(${fg}=${TOKENS[fg]} on ${bg}=${TOKENS[bg]}) = ${ratio.toFixed(2)}`,
    ).toBeGreaterThanOrEqual(min);
  });
});
