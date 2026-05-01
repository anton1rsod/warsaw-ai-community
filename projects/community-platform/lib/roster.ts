import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parseMarkdown, truncateToFirstH2 } from "@/lib/markdown";

export interface RosterMember {
  name: string;
  githubHandle: string;
  slug: string;
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
 * Slugify a display name:
 * - NFKD-normalize to decompose accented chars
 * - Strip combining diacritics (Unicode combining characters U+0300–U+036F)
 * - Lowercase
 * - Replace runs of non-[a-z0-9] with a hyphen
 * - Strip leading/trailing hyphens
 */
function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Split a Markdown table row into individual cell values.
 * Strips the outer pipes, splits on `|`, and trims each cell.
 * Empty cells are preserved (NOT filtered) so column indices remain stable.
 */
function parseCells(line: string): string[] {
  // Remove leading and trailing pipe, then split on inner pipes
  const inner = line.replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((cell) => cell.trim());
}

/**
 * Determine if a table row is a separator (e.g. `|---|---|---|`).
 */
function isSeparatorRow(line: string): boolean {
  return /^\|[\s\-|:]+\|$/.test(line.trim());
}

/**
 * Read and parse a Markdown roster file with one or more pipe-delimited tables.
 *
 * Per execution-plan §9.1 amendment:
 * - Detects the GitHub column by case-insensitive header name match per table.
 * - Skips rows whose Name cell contains `*(TBD)*` literally.
 * - Skips rows whose GitHub cell is empty after trimming.
 * - Skips rows whose handle normalizes to `"tbd"`.
 * - Re-detects headers for each table (non-`|` lines reset state).
 */
export async function readRoster(filePath: string): Promise<RosterMember[]> {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");

  const members: RosterMember[] = [];

  let pendingHeader: string[] | null = null; // cells from the last `|`-line before a separator
  let githubColIndex = -1; // resolved after separator is found
  let inTableBody = false; // true once separator is consumed for this table

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line.startsWith("|")) {
      // Non-table line — reset per-table state so next table re-detects its header
      pendingHeader = null;
      githubColIndex = -1;
      inTableBody = false;
      continue;
    }

    if (isSeparatorRow(line)) {
      // The line immediately before this separator is the header row
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
      // Still looking for the separator — stash this as a candidate header
      pendingHeader = cells;
      continue;
    }

    // We are in the table body — apply inclusion rules
    if (githubColIndex === -1) continue;

    const nameCell = cells[0] ?? "";
    const githubCell = cells[githubColIndex] ?? "";

    // §9.1: skip *(TBD)* name rows
    if (nameCell.includes("*(TBD)*")) continue;

    // Skip all-empty name rows
    if (nameCell === "") continue;

    const handle = normalizeHandle(githubCell);

    // Skip empty or @TBD handles
    if (handle === "") continue;

    members.push({
      name: nameCell,
      githubHandle: handle,
      slug: slugify(nameCell),
    });
  }

  return members;
}

/**
 * Look up a roster member by GitHub handle.
 * Input is normalized the same way as stored handles:
 * strips a leading `@`, lowercases, trims whitespace.
 * Returns `undefined` for empty input or unknown handles.
 */
export function lookupMemberByHandle(
  roster: readonly RosterMember[],
  handle: string,
): RosterMember | undefined {
  if (!handle) return undefined;
  const normalized = normalizeHandle(handle);
  if (!normalized) return undefined;
  return roster.find((m) => m.githubHandle === normalized);
}

export interface MemberProfile {
  data: Record<string, unknown>;
  body: string;
}

function isENOENT(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "ENOENT"
  );
}

export async function readMemberProfile(
  repoRoot: string,
  slug: string,
): Promise<MemberProfile | null> {
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\"))
    return null;
  const filePath = path.join(repoRoot, "community/members", `${slug}.md`);
  try {
    const content = await readFile(filePath, "utf8");
    return parseMarkdown(content);
  } catch (err: unknown) {
    if (isENOENT(err)) return null;
    throw err;
  }
}

export async function readMemberPersona(
  repoRoot: string,
  slug: string,
): Promise<string | null> {
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\"))
    return null;
  const dir = path.join(repoRoot, "persona-builder/personas", slug);
  try {
    const files = await readdir(dir);
    // Sort for deterministic pick when a persona dir contains multiple .md files
    // (readdir order is not guaranteed alphabetical across filesystems).
    const md = files.filter((f) => f.endsWith(".md")).sort()[0];
    if (!md) return null;
    const content = await readFile(path.join(dir, md), "utf8");
    const { body } = parseMarkdown(content);
    return truncateToFirstH2(body);
  } catch (err: unknown) {
    if (isENOENT(err)) return null;
    throw err;
  }
}
