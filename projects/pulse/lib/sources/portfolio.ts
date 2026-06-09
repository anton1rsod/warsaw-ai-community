import { ProjectSchema, PROJECT_STATUSES, type Project } from "../types.js";
import { readFileOrNull, REPO_ROOT } from "./repo-io.js";
import path from "node:path";

/** Lines of the markdown section that starts at `## <heading>` until the next `## `. */
function sectionLines(content: string, heading: string): string[] | null {
  const lines = content.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith("## "));
  return end === -1 ? rest : rest.slice(0, end);
}

/** Split a markdown table row `| a | b |` into trimmed cells. */
function cells(row: string): string[] {
  return row.split("|").slice(1, -1).map((c) => c.trim());
}

function statusOf(cell: string): Project["status"] {
  // Match the status word right after `**`, tolerating a parenthetical like "**Live (v1)**".
  const found = PROJECT_STATUSES.find((s) => new RegExp(`\\*\\*\\s*${s}\\b`).test(cell));
  if (!found) throw new Error(`No recognized status in cell: ${cell}`);
  return found;
}

export function parsePortfolio(content: string): Project[] {
  const section = sectionLines(content, "Active portfolio");
  if (!section) throw new Error("PROJECTS.md: missing '## Active portfolio' section");

  const rows = section.filter((l) => l.trim().startsWith("|"));
  const dataRows = rows.filter((l) => !/^\|\s*Project\s*\|/.test(l) && !/^\|\s*-{2,}/.test(l) && !/\|\s*---/.test(l));

  const projects = dataRows.map((row) => {
    const c = cells(row);
    if (c.length < 6) throw new Error(`PROJECTS.md row has <6 cells: ${row}`);
    const name = /\[([^\]]+)\]/.exec(c[0] ?? "")?.[1];
    if (!name) throw new Error(`PROJECTS.md: cannot parse project name from: ${c[0]}`);
    const cleanPath = (c[1] ?? "").replace(/`/g, "").trim();
    const slug = cleanPath.replace(/\/$/, "").split("/").filter(Boolean).pop() ?? "";
    const version = /\bv\d+\.\d+[\w.]*/.exec(c[2] ?? "")?.[0] ?? "";
    return ProjectSchema.parse({
      slug,
      name,
      path: cleanPath,
      status: statusOf(c[2] ?? ""),
      dri: c[3] ?? "",
      version,
      currentFocus: c[4] ?? "",
      nextGate: c[5] ?? "",
    });
  });

  if (projects.length === 0) throw new Error("PROJECTS.md: Active portfolio table has no data rows");
  return projects;
}

export async function loadPortfolio(repoRoot = REPO_ROOT): Promise<Project[]> {
  const content = await readFileOrNull(path.join(repoRoot, "PROJECTS.md"));
  if (content === null) throw new Error("PROJECTS.md not found");
  return parsePortfolio(content);
}
