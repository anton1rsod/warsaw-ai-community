import fs from "node:fs/promises";
import path from "node:path";

export interface DecisionSummary {
  number: number;
  slug: string;
  title: string;
  date?: string;
  status?: string;
}

export interface Decision extends DecisionSummary {
  body: string;
}

const FILE_RE = /^(\d{4})-(.+)\.md$/;

function isENOENT(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "ENOENT"
  );
}

function extractMeta(
  body: string,
): { title: string; date?: string; status?: string } {
  return {
    title: body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "Untitled",
    status: body.match(/^\*\*Status:\*\*\s*(.+)$/m)?.[1]?.trim(),
    date: body.match(/^\*\*Date:\*\*\s*(.+)$/m)?.[1]?.trim(),
  };
}

export async function listDecisions(
  repoRoot: string,
): Promise<DecisionSummary[]> {
  const dir = path.join(repoRoot, "docs/decisions");
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const summaries: DecisionSummary[] = [];

  for (const name of entries) {
    const m = name.match(FILE_RE);
    if (!m || !m[1]) continue;
    const body = await fs.readFile(path.join(dir, name), "utf8");
    const meta = extractMeta(body);
    summaries.push({
      number: Number.parseInt(m[1], 10),
      slug: name.replace(/\.md$/, ""),
      ...meta,
    });
  }

  summaries.sort((a, b) => a.number - b.number);
  return summaries;
}

export async function readDecision(
  repoRoot: string,
  slug: string,
): Promise<Decision | null> {
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\"))
    return null;
  const filePath = path.join(repoRoot, "docs/decisions", `${slug}.md`);
  try {
    const body = await fs.readFile(filePath, "utf8");
    const m = slug.match(/^(\d{4})-/);
    if (!m || !m[1]) return null;
    const meta = extractMeta(body);
    return { number: Number.parseInt(m[1], 10), slug, body, ...meta };
  } catch (err: unknown) {
    if (isENOENT(err)) return null;
    throw err;
  }
}
