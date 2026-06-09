import { RepoStateSchema, type Driver, type RepoState } from "../types.js";
import { readFileOrNull, REPO_ROOT } from "./repo-io.js";
import path from "node:path";

function sectionLines(content: string, heading: string): string[] {
  const lines = content.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith("## "));
  return end === -1 ? rest : rest.slice(0, end);
}

function bullets(lines: string[]): string[] {
  return lines.map((l) => l.trim()).filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim());
}

const DRIVER_RE = /^\*\*(.+?) \((.+?)\):\*\*\s*(.*)$/;

export function parseRootState(content: string): RepoState {
  const lastUpdated = /\*\*Last updated:\*\*\s*(\S+)/.exec(content)?.[1] ?? "";

  const drivers: Driver[] = bullets(sectionLines(content, "Active drivers")).flatMap((b) => {
    const m = DRIVER_RE.exec(b);
    return m ? [{ name: m[1] as string, role: m[2] as string, detail: (m[3] ?? "").trim() }] : [];
  });

  const hotNow = bullets(sectionLines(content, "Hot now"));

  const rawBlockers = bullets(sectionLines(content, "Blockers"));
  const blockers = rawBlockers.length === 1 && /^none\.?$/i.test(rawBlockers[0] ?? "") ? [] : rawBlockers;

  return RepoStateSchema.parse({ lastUpdated, drivers, hotNow, blockers });
}

export async function loadRootState(repoRoot = REPO_ROOT): Promise<RepoState> {
  const content = await readFileOrNull(path.join(repoRoot, "STATE.md"));
  if (content === null) throw new Error("root STATE.md not found");
  return parseRootState(content);
}
