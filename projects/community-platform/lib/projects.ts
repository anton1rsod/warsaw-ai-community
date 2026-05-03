import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

export interface ProjectSummary {
  slug: string;
  title: string;
}

export interface ProjectDetail extends ProjectSummary {
  readme: string | null;
  spec: string | null;
  plan: string | null;
  changelog: string | null;
}

function isENOENT(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "ENOENT"
  );
}

function extractH1Title(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

async function readOptionalFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf-8");
  } catch (err: unknown) {
    if (isENOENT(err)) return null;
    throw err;
  }
}

async function isDirectory(fullPath: string): Promise<boolean> {
  try {
    const s = await stat(fullPath);
    return s.isDirectory();
  } catch {
    return false;
  }
}

/**
 * List all projects under `<repoRoot>/projects/`.
 * Excludes entries whose name starts with `_` or `.`.
 * Returns results sorted by title ascending.
 */
export async function listProjects(
  repoRoot: string,
): Promise<ProjectSummary[]> {
  const projectsDir = path.join(repoRoot, "projects");
  let entries: string[];
  try {
    entries = await readdir(projectsDir);
  } catch (err: unknown) {
    if (isENOENT(err)) return [];
    throw err;
  }

  const results: ProjectSummary[] = [];

  for (const entry of entries) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;

    const fullPath = path.join(projectsDir, entry);
    if (!(await isDirectory(fullPath))) continue;

    const readmePath = path.join(fullPath, "README.md");
    const readmeContent = await readOptionalFile(readmePath);
    const title =
      readmeContent !== null
        ? (extractH1Title(readmeContent) ?? entry)
        : entry;

    results.push({ slug: entry, title });
  }

  return results.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Load all available Markdown documents for a single project.
 * Security: rejects slugs starting with `_`, containing `..`, or containing `/`.
 * Returns null if the project directory does not exist.
 */
export async function readProject(
  repoRoot: string,
  slug: string,
): Promise<ProjectDetail | null> {
  if (slug.startsWith("_") || slug.includes("..") || slug.includes("/")) {
    return null;
  }

  const projectDir = path.join(repoRoot, "projects", slug);
  if (!(await isDirectory(projectDir))) return null;

  const [readme, spec, plan, changelog] = await Promise.all([
    readOptionalFile(path.join(projectDir, "README.md")),
    readOptionalFile(path.join(projectDir, "spec.md")),
    readOptionalFile(path.join(projectDir, "plan.md")),
    readOptionalFile(path.join(projectDir, "CHANGELOG.md")),
  ]);

  const title =
    readme !== null ? (extractH1Title(readme) ?? slug) : slug;

  return { slug, title, readme, spec, plan, changelog };
}
