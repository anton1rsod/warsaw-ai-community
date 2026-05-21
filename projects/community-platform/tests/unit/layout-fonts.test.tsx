import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const layoutSrc = readFileSync(
  resolve(__dirname, "../../app/layout.tsx"),
  "utf-8",
);

describe("H87: layout.tsx font loading", () => {
  it("imports Fraunces from next/font/google with variable weight + axes", () => {
    expect(layoutSrc).toMatch(/import\s*\{[^}]*\bFraunces\b[^}]*\}\s*from\s*["']next\/font\/google["']/);
    expect(layoutSrc).toMatch(/Fraunces\s*\(\s*\{[\s\S]*?weight:\s*["']variable["']/);
    expect(layoutSrc).toMatch(/Fraunces\s*\(\s*\{[\s\S]*?axes:\s*\[[\s\S]*?["']SOFT["'][\s\S]*?["']WONK["']/);
    expect(layoutSrc).toMatch(/Fraunces\s*\(\s*\{[\s\S]*?display:\s*["']swap["']/);
  });

  it("imports JetBrains_Mono from next/font/google with weight 400+700 and swap", () => {
    expect(layoutSrc).toMatch(/import\s*\{[^}]*\bJetBrains_Mono\b[^}]*\}\s*from\s*["']next\/font\/google["']/);
    expect(layoutSrc).toMatch(/JetBrains_Mono\s*\(\s*\{[\s\S]*?weight:\s*\[[\s\S]*?["']400["'][\s\S]*?["']700["']/);
    expect(layoutSrc).toMatch(/JetBrains_Mono\s*\(\s*\{[\s\S]*?display:\s*["']swap["']/);
  });

  it("keeps Inter import unchanged (v0.4 baseline)", () => {
    expect(layoutSrc).toMatch(/import\s*\{[^}]*\bInter\b[^}]*\}\s*from\s*["']next\/font\/google["']/);
    expect(layoutSrc).toMatch(/Inter\s*\(\s*\{[\s\S]*?weight:\s*\[[\s\S]*?["']400["'][\s\S]*?["']600["']/);
  });

  it("html element carries all three CSS variable classes", () => {
    expect(layoutSrc).toMatch(/className=\{`\$\{fraunces\.variable\}\s*\$\{inter\.variable\}\s*\$\{jetbrains\.variable\}`\}/);
  });
});
