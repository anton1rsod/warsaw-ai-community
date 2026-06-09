import { AdrSchema, type Adr } from "../types.js";
import { readFileOrNull, REPO_ROOT } from "./repo-io.js";
import path from "node:path";

function cells(row: string): string[] {
  return row.split("|").slice(1, -1).map((c) => c.trim());
}

export function parseDecisions(readmeContent: string): Adr[] {
  const rows = readmeContent
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\|\s*\[\d{4}\]/.test(l)); // only rows whose first cell is a [NNNN](...) link

  const adrs = rows.map((row) => {
    const c = cells(row);
    const idCell = c[0] ?? "";
    const id = /\[(\d{4})\]/.exec(idCell)?.[1];
    const file = /\(([^)]+\.md)\)/.exec(idCell)?.[1];
    if (!id || !file) throw new Error(`docs/decisions/README.md: bad index row: ${row}`);
    return AdrSchema.parse({
      id,
      adr: `ADR-${id}`,
      title: c[1] ?? "",
      status: c[2] ?? "",
      date: c[3] ?? "",
      path: `docs/decisions/${file}`,
    });
  });

  if (adrs.length === 0) throw new Error("docs/decisions/README.md: no ADR index rows found");
  return adrs;
}

export async function loadDecisions(repoRoot = REPO_ROOT): Promise<Adr[]> {
  const content = await readFileOrNull(path.join(repoRoot, "docs/decisions/README.md"));
  if (content === null) throw new Error("docs/decisions/README.md not found");
  return parseDecisions(content);
}
