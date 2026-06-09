import { readdir } from "node:fs/promises";
import path from "node:path";
import { ReleaseSchema, type Release } from "../types.js";
import { readFileOrNull, REPO_ROOT } from "./repo-io.js";

// "## [<version>] <sep> <YYYY-MM-DD><rest>" where <sep> is em-dash or hyphen.
const HEADING_RE = /^##\s*\[([^\]]+)\]\s*[—-]\s*(\d{4}-\d{2}-\d{2})(.*)$/;
const SEMVER_RE = /^\d+\.\d+/;

function cleanSummary(rest: string): string {
  return rest.replace(/^[\s—\-(]+/, "").replace(/[)\s]+$/, "").trim();
}

export function parseChangelog(content: string, projectSlug: string): Release[] {
  const out: Release[] = [];
  for (const line of content.split("\n")) {
    const m = HEADING_RE.exec(line.trim());
    if (!m) continue;
    const version = (m[1] ?? "").trim();
    if (!SEMVER_RE.test(version)) continue; // skips [Unreleased] etc.
    out.push(
      ReleaseSchema.parse({
        project: projectSlug,
        version,
        date: m[2] ?? "",
        summary: cleanSummary(m[3] ?? ""),
      }),
    );
  }
  return out;
}

/** `<slug>-v<version>` tag lines → Set of "<slug>@<version>". */
export function parseTagSet(tagLines: readonly string[]): Set<string> {
  const set = new Set<string>();
  for (const line of tagLines) {
    const m = /^(.+)-v(\d+\.\d+[\w.]*)$/.exec(line.trim());
    if (m) set.add(`${m[1]}@${m[2]}`);
  }
  return set;
}

export async function loadReleases(repoRoot = REPO_ROOT): Promise<Release[]> {
  const projectsDir = path.join(repoRoot, "projects");
  let dirs: string[];
  try {
    dirs = await readdir(projectsDir);
  } catch {
    return [];
  }
  const out: Release[] = [];
  for (const slug of dirs) {
    if (slug.startsWith("_") || slug.startsWith(".")) continue;
    const content = await readFileOrNull(path.join(projectsDir, slug, "CHANGELOG.md"));
    if (content) out.push(...parseChangelog(content, slug));
  }
  return out;
}
