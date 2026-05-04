// projects/community-platform/tests/unit/persona-folder-slug-consistency.test.ts
//
// Forward-defending invariant test introduced after chat-10 Option D
// (persona slug↔folder mismatch). The bug: persona folders were named
// `<firstname>-<lastinitial>` (e.g. `mark-s`), but roster-driven slugs
// produce `<firstname>-<lastname>` (e.g. `mark-spasonov`) via slugify().
// Result: PersonaPanel never rendered for affected members because
// readMemberPersona(slug) couldn't locate the folder.
//
// This test asserts that for every persona folder, its name equals
// slugify(frontmatter.display_name), so the same drift can't recur
// silently when a future member is onboarded.
//
// Known exception: display_names whose slugify() returns "" (Cyrillic,
// purely-symbolic, etc. — slugify is currently NFKD+[a-z0-9] only, no
// transliteration). Those folders use a hand-picked privacy shorthand
// and are skipped here. If transliteration lands, drop the skip.

import { describe, it, expect } from "vitest";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { slugify } from "@/lib/slug";

// Resolve the personas root from this test file: tests/unit → up 4 to
// repo root, then into persona-builder/personas. Pinned via __dirname
// equivalent so the test passes regardless of where vitest is invoked.
const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..", "..", "..");
const PERSONAS_DIR = path.join(REPO_ROOT, "persona-builder", "personas");

interface PersonaFrontmatter {
  readonly persona_id?: string;
  readonly display_name?: string;
}

async function readPersonaDisplayName(folder: string): Promise<string | null> {
  const dir = path.join(PERSONAS_DIR, folder);
  const files = await readdir(dir);
  const publicMd = files.find((f) => f.endsWith(".public.md"));
  if (!publicMd) return null;
  const content = await readFile(path.join(dir, publicMd), "utf8");
  const data = matter(content).data as PersonaFrontmatter;
  return typeof data.display_name === "string" ? data.display_name : null;
}

async function listPersonaFolders(): Promise<string[]> {
  // Only directories — skip .DS_Store, .gitkeep, README.md at the
  // personas-root level. readdir(withFileTypes) gives Dirent objects
  // we can filter by isDirectory().
  const entries = await readdir(PERSONAS_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

describe("persona folder ↔ slug consistency", () => {
  it("every persona folder name equals slugify(display_name) — or is documented empty-slug exception", async () => {
    const folders = await listPersonaFolders();
    expect(folders.length).toBeGreaterThan(0);

    const mismatches: string[] = [];
    const skipped: string[] = [];

    for (const folder of folders) {
      const displayName = await readPersonaDisplayName(folder);
      if (displayName === null) {
        mismatches.push(`${folder}: missing or unreadable .public.md frontmatter`);
        continue;
      }
      const expected = slugify(displayName);
      if (expected === "") {
        // slugify drops everything → folder uses hand-picked shorthand.
        // Acceptable until slugify gains transliteration. Document and skip.
        skipped.push(`${folder} (display_name "${displayName}" → empty slug)`);
        continue;
      }
      if (folder !== expected) {
        mismatches.push(
          `${folder}: display_name "${displayName}" → slugify="${expected}", expected folder named "${expected}"`,
        );
      }
    }

    expect(mismatches).toEqual([]);

    // Self-document the skip list so any future reviewer sees what was
    // accepted as a known limitation. Snapshot would be heavier; this
    // log surfaces in CI verbose output without failing the test.
    if (skipped.length > 0) {
       
      console.warn(
        `[persona-folder-slug-consistency] skipped (empty slugify): ${skipped.join(", ")}`,
      );
    }
  });

  it("Mark Spasonov is discoverable via readMemberPersona", async () => {
    // Direct correctness check for the original bug. Mark is on the
    // roster (community/members/roster.md) with display_name "Mark
    // Spasonov" → slug "mark-spasonov". His persona folder must use
    // that exact slug.
    const folders = await listPersonaFolders();
    expect(folders).toContain("mark-spasonov");
  });
});
