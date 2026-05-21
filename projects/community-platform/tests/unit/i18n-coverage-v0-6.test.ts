import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const TARGET_FILES = [
  "app/page.tsx",
  "app/home/page.tsx",
  "app/events/page.tsx",
  "app/events/[slug]/page.tsx",
  "app/components/Header.tsx",
  "app/components/Footer.tsx",
  "app/components/EventCard.tsx",
  "app/components/AnonymousHero.tsx",
  "app/components/YourWeekPane.tsx",
  "app/components/HomeFeed.tsx",
];

const ALLOWED_LITERAL_PATTERNS: RegExp[] = [
  /^[·▾→✓★—–\s]+$/,
  /^[/#@]/,
  /^\s*$/,
  /^\d+$/,
];

const TS_EXPRESSION_INDICATORS = /[<>=!&|()[\]{};]|===|!==|&&|\|\|| as \b/;
const TS_PROPERTY_ACCESS = /^[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-z]/;

function stripCommentsAndExpressions(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*$/gm, "");
}

function extractHardcodedJsxText(src: string): string[] {
  const stripped = stripCommentsAndExpressions(src);
  const matches = stripped.match(/>([^<>{}\n]{2,})</g) ?? [];
  return matches
    .map((m) => m.slice(1, -1).trim())
    .filter((t) => {
      if (t.length === 0) return false;
      if (ALLOWED_LITERAL_PATTERNS.some((p) => p.test(t))) return false;
      if (TS_EXPRESSION_INDICATORS.test(t)) return false;
      if (TS_PROPERTY_ACCESS.test(t)) return false;
      return true;
    });
}

describe("H88: v0.6 UI surfaces use s(key) — no hardcoded English copy", () => {
  it.each(TARGET_FILES)("%s contains no JSX text literals (all copy via s())", (file) => {
    const src = readFileSync(resolve(__dirname, "../../", file), "utf-8");
    const hardcoded = extractHardcodedJsxText(src);
    expect(
      hardcoded,
      `Hardcoded copy in ${file}: ${hardcoded.join(" | ")}`,
    ).toHaveLength(0);
  });
});
