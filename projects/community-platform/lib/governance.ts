import { readFile } from "node:fs/promises";

export interface GovernanceSnapshot {
  readonly admins: readonly string[];
  readonly communityManagers: readonly string[];
  isAdmin(handle: string): boolean;
  isCommunityManager(handle: string): boolean;
}

/**
 * Normalize a raw GitHub cell value into a clean handle.
 * Strips leading `@`, lowercases, and trims whitespace.
 * Returns empty string if the cell is empty or normalizes to "tbd".
 */
function normalizeHandle(raw: string): string {
  const trimmed = raw.trim().replace(/^@/, "").toLowerCase().trim();
  if (trimmed === "" || trimmed === "tbd") return "";
  return trimmed;
}

/**
 * Determine if a table row is a separator (e.g. `|---|---|---|`).
 */
function isSeparatorRow(line: string): boolean {
  return /^\|[\s\-|:]+\|$/.test(line.trim());
}

/**
 * Split a Markdown table row into individual cell values.
 * Strips the outer pipes, splits on `|`, and trims each cell.
 * Empty cells are preserved (NOT filtered) so column indices remain stable.
 */
function parseCells(line: string): string[] {
  const inner = line.replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((cell) => cell.trim());
}

/**
 * Parse a governance Markdown file and extract all valid GitHub handles.
 *
 * Uses the same header-aware pattern as lib/roster.ts:
 * - Detects the GitHub column by case-insensitive header name match per table.
 * - Skips rows whose Name cell contains `*(TBD)*` literally.
 * - Skips rows whose GitHub cell is empty after trimming.
 * - Skips rows whose handle normalizes to `"tbd"`.
 * - Re-detects headers for each table (non-`|` lines reset state).
 */
async function parseHandlesFromFile(filePath: string): Promise<string[]> {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");

  const handles: string[] = [];

  let pendingHeader: string[] | null = null;
  let githubColIndex = -1;
  let inTableBody = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line.startsWith("|")) {
      pendingHeader = null;
      githubColIndex = -1;
      inTableBody = false;
      continue;
    }

    if (isSeparatorRow(line)) {
      if (pendingHeader !== null) {
        githubColIndex = pendingHeader.findIndex((h) =>
          /^github$/i.test(h),
        );
      }
      inTableBody = true;
      pendingHeader = null;
      continue;
    }

    const cells = parseCells(line);

    if (!inTableBody) {
      pendingHeader = cells;
      continue;
    }

    if (githubColIndex === -1) continue;

    const nameCell = cells[0] ?? "";
    const githubCell = cells[githubColIndex] ?? "";

    if (nameCell.includes("*(TBD)*")) continue;
    if (nameCell === "") continue;

    const handle = normalizeHandle(githubCell);
    if (handle === "") continue;

    handles.push(handle);
  }

  return handles;
}

/**
 * Read and parse governance files for admins and community managers.
 *
 * Resolves both files in parallel via Promise.all.
 * Builds Set-backed O(1) predicates for isAdmin / isCommunityManager.
 * Both predicates normalize input identically (strip @, lowercase, trim)
 * and return false for empty input.
 */
export async function readGovernance(opts: {
  adminsPath: string;
  cmsPath: string;
}): Promise<GovernanceSnapshot> {
  const [admins, communityManagers] = await Promise.all([
    parseHandlesFromFile(opts.adminsPath),
    parseHandlesFromFile(opts.cmsPath),
  ]);

  const adminSet = new Set(admins);
  const cmSet = new Set(communityManagers);

  function resolveHandle(handle: string): string {
    if (!handle) return "";
    return handle.trim().replace(/^@/, "").toLowerCase().trim();
  }

  return {
    admins,
    communityManagers,
    isAdmin(handle: string): boolean {
      const normalized = resolveHandle(handle);
      if (!normalized) return false;
      return adminSet.has(normalized);
    },
    isCommunityManager(handle: string): boolean {
      const normalized = resolveHandle(handle);
      if (!normalized) return false;
      return cmSet.has(normalized);
    },
  };
}
