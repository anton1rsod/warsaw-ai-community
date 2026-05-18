#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * H67 second half — grep-based scan asserting Phase A strict-list
 * components do NOT have inline JSX text-node string literals.
 *
 * "Inline JSX text-node string literal" pattern:
 *   >SomeTitle Cased Text<
 * vs. allowed:
 *   >{s("key")}<     (a brace expression)
 *   >&nbsp;<         (an HTML entity)
 *   > <              (whitespace only)
 *
 * Test failure is a signal to add the string to lib/i18n/strings.ts.
 */
const STRICT_LIST_COMPONENTS = [
  "app/components/Header.tsx",
  "app/components/HeaderMobileMenu.tsx",
  "app/components/Footer.tsx",
  "app/components/Avatar.tsx",
  "app/components/ListItem.tsx",
  "app/components/DateTime.tsx",
  "app/components/Tag.tsx",
  "app/components/EmptyState.tsx",
  "app/components/AnonymousHero.tsx",
  "app/components/YourWeekPane.tsx",
  "app/components/RootShell.tsx",
];

const inlineStringRegex = />[A-Z][a-zA-Z0-9 '.,?!:&-]+</g;

export function scanForInlineStrings(repoRoot: string): {
  ok: boolean;
  hits: { file: string; matches: string[] }[];
} {
  const hits: { file: string; matches: string[] }[] = [];
  for (const file of STRICT_LIST_COMPONENTS) {
    const path = join(repoRoot, file);
    let content: string;
    try {
      content = readFileSync(path, "utf-8");
    } catch {
      continue;
    }
    const matches = Array.from(content.matchAll(inlineStringRegex)).map(
      (m) => m[0],
    );
    const filtered = matches.filter(
      (m) => !m.includes("Warsaw AI"),
    );
    if (filtered.length > 0) {
      hits.push({ file, matches: filtered });
    }
  }
  return { ok: hits.length === 0, hits };
}

// CLI detection: works with both `node` (import.meta.url === file://argv1)
// and `tsx` (which may pass a relative argv[1] — resolve it to absolute first).
const argv1Abs = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
const isCliInvocation =
  import.meta.url === argv1Abs ||
  import.meta.url === `file://${process.argv[1]}`;

if (isCliInvocation) {
  const result = scanForInlineStrings(process.cwd());
  if (!result.ok) {
    console.error("[H67] FAIL — inline JSX text-node strings found:");
    for (const hit of result.hits) {
      console.error(`  ${hit.file}:`);
      for (const m of hit.matches) {
        console.error(`    ${m}`);
      }
    }
    console.error(
      "\nFix: add the string to lib/i18n/strings.ts and consume via s('<key>').",
    );
    process.exitCode = 1;
  } else {
    console.log("[H67] OK — no inline strings in Phase A strict-list components");
  }
}
