#!/usr/bin/env node
import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * H68 — persona slug-folder integrity check.
 *
 * Every persona-builder/personas/<X>/ folder must map to a
 * community/members/<X>.md profile file. A folder without a matching
 * profile is an ORPHAN FOLDER (data-exposure risk — the persona
 * content has no owner in the member registry). A profile file without
 * a folder is ALLOWED (members can opt out of personas entirely; the
 * script reports as informational).
 *
 * Invoked as CI step:
 *   pnpm validate-persona-folders
 *
 * On orphan folder: prints diagnostic and the CLI wrapper terminates
 * the Node process with a non-zero status code.
 */
export interface ValidationInput {
  rosterSlugs: string[];
  personaFolders: string[];
}

export interface ValidationResult {
  ok: boolean;
  orphanFolders: string[];      // persona folders without a roster slug
  orphanRosterSlugs: string[];  // roster slugs without a persona folder (informational)
}

export function validatePersonaFolders(
  input: ValidationInput,
): ValidationResult {
  const rosterSet = new Set(input.rosterSlugs);
  const folderSet = new Set(input.personaFolders);

  const orphanFolders = input.personaFolders.filter(
    (f) => !rosterSet.has(f),
  );
  const orphanRosterSlugs = input.rosterSlugs.filter(
    (s) => !folderSet.has(s),
  );

  return {
    ok: orphanFolders.length === 0,
    orphanFolders,
    orphanRosterSlugs,
  };
}

function readRosterSlugs(repoRoot: string): string[] {
  const membersDir = join(repoRoot, "community", "members");
  try {
    return readdirSync(membersDir, { withFileTypes: true })
      .filter((f) => f.isFile() && f.name.endsWith(".md") && f.name !== "roster.md" && f.name !== "invitations.md" && f.name !== "git-email-aliases.md")
      .map((f) => f.name.replace(/\.md$/, ""))
      .filter((slug) => !slug.startsWith(".") && !slug.startsWith("_"));
  } catch {
    return [];
  }
}

function readPersonaFolders(repoRoot: string): string[] {
  const personasRoot = join(repoRoot, "persona-builder", "personas");
  try {
    return readdirSync(personasRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((name) => !name.startsWith(".") && !name.startsWith("_"));
  } catch {
    return [];
  }
}

const isCliInvocation = process.argv[1]?.endsWith("validate-persona-folders.ts");
if (isCliInvocation) {
  const repoRoot = join(process.cwd(), "..", "..");
  const rosterSlugs = readRosterSlugs(repoRoot);
  const personaFolders = readPersonaFolders(repoRoot);
  const result = validatePersonaFolders({ rosterSlugs, personaFolders });

  if (result.orphanRosterSlugs.length > 0) {
    console.log(
      `[validate-persona-folders] Members without a persona folder (informational): ${result.orphanRosterSlugs.join(", ")}`,
    );
  }

  if (!result.ok) {
    console.error(
      `[validate-persona-folders] FAIL — orphan persona folders without a roster slug:`,
    );
    for (const folder of result.orphanFolders) {
      console.error(`  - persona-builder/personas/${folder}/`);
    }
    console.error(
      `\nFix: either rename the folder to match a member profile OR add a new member profile to community/members/<slug>.md.`,
    );
    process.exitCode = 1;
  } else {
    console.log("[validate-persona-folders] OK");
  }
}
