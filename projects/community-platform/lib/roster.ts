import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parseMarkdown } from "@/lib/markdown";
import { slugify } from "@/lib/slug";

export interface RosterMember {
  name: string;
  githubHandle: string;
  slug: string;
  /** v0.12: optional roster columns (spec §4.3). null = absent column, empty cell, or TBD. */
  telegram: string | null;
  link: string | null;
  focus: string | null;
}

/**
 * Normalize a raw GitHub cell value into a clean handle.
 * Strips leading `@`, lowercases, and trims whitespace.
 * Returns empty string if the cell is empty or normalizes to "tbd".
 */
function normalizeHandle(raw: string): string {
  const trimmed = raw.trim().replace(/^@/, "").toLowerCase().trim();
  if (trimmed === "" || trimmed === "tbd" || /^\*\(.*\)\*$/.test(trimmed)) return "";
  return trimmed;
}

/**
 * v0.12: normalize an optional roster cell (Telegram / Link / Focus).
 * Returns null when the cell is empty or contains "TBD" in any case —
 * including annotated values like "@antonsafronov (TBD)", which are
 * placeholders, not usable contact data.
 */
function normalizeOptionalCell(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "" || /tbd/i.test(trimmed)) return null;
  return trimmed;
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
 * Parse roster Markdown CONTENT (string) into members. Extracted from
 * readRoster so callers holding file content (e.g. the redemption
 * orchestrator's live dup-handle guard, H128) can reuse the exact parsing.
 */
export function parseRosterContent(content: string): RosterMember[] {
  const lines = content.split("\n");
  const members: RosterMember[] = [];

  let pendingHeader: string[] | null = null;
  let githubColIndex = -1;
  let telegramColIndex = -1;
  let linkColIndex = -1;
  let focusColIndex = -1;
  let inTableBody = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line.startsWith("|")) {
      pendingHeader = null;
      githubColIndex = -1;
      telegramColIndex = -1;
      linkColIndex = -1;
      focusColIndex = -1;
      inTableBody = false;
      continue;
    }

    if (isSeparatorRow(line)) {
      if (pendingHeader !== null) {
        githubColIndex = pendingHeader.findIndex((h) => /^github$/i.test(h));
        // v0.12: optional columns detected per table — a table may lack any
        // of them (Core organizers has no Link column).
        telegramColIndex = pendingHeader.findIndex((h) => /^telegram$/i.test(h));
        linkColIndex = pendingHeader.findIndex((h) => /^link$/i.test(h));
        focusColIndex = pendingHeader.findIndex((h) => /^focus$/i.test(h));
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

    const telegram =
      telegramColIndex === -1
        ? null
        : normalizeOptionalCell(cells[telegramColIndex] ?? "");
    const link =
      linkColIndex === -1 ? null : normalizeOptionalCell(cells[linkColIndex] ?? "");
    const focus =
      focusColIndex === -1 ? null : normalizeOptionalCell(cells[focusColIndex] ?? "");

    members.push({
      name: nameCell,
      githubHandle: handle,
      slug: slugify(nameCell),
      telegram,
      link,
      focus,
    });
  }

  return members;
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
  return parseRosterContent(content);
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
    // H138/H139: render the peer-facing .public.md ONLY (persona-builder
    // consent model — the full .md may carry `## Private notes`). If no
    // .public.md exists, fail closed (treat as no public persona).
    const pub = files.find((f) => f.endsWith(".public.md"));
    if (!pub) return null;
    // H138/H139: return the RAW .public.md content (frontmatter + body) so the
    // caller's parsePersona can read frontmatter (languages) AND strip the
    // `## Tags` block. (Returning body-only here drops the frontmatter that
    // `languages` lives in.) parseMarkdown is still used by readMemberProfile.
    return readFile(path.join(dir, pub), "utf8");
  } catch (err: unknown) {
    if (isENOENT(err)) return null;
    throw err;
  }
}

export interface AppendMemberInput {
  readonly name: string;
  readonly githubHandle: string; // no leading @
  readonly telegram: string; // includes @, or empty
  readonly link: string; // empty allowed
  readonly focus: string; // empty allowed
}

const MEMBERS_HEADING = "## Members (opt-in)";

function escapeMdCell(s: string): string {
  return s.replaceAll("|", "&#124;");
}

/**
 * Append a row to the Members (opt-in) table.
 *
 * Strategy: locate the "## Members (opt-in)" heading, then find the
 * NEXT non-table line (or end-of-file) — insert the new row directly
 * before it so trailing prose (`## Notes`) is preserved.
 *
 * Output schema (5 columns):
 *   | Name | GitHub | Telegram | Link | Focus |
 *
 * Pipes in name + focus are escaped to `&#124;`. Other fields don't
 * accept user-supplied newlines (rejected by RedeemFormSchema H10) or
 * pipes (telegram regex prevents; gh handle is `[a-zA-Z0-9-]+`; link
 * is URL-validated).
 */
export function appendMember(
  rosterMd: string,
  input: AppendMemberInput,
): string {
  const lines = rosterMd.split("\n");
  const headingIdx = lines.findIndex((l) => l.trim() === MEMBERS_HEADING);
  if (headingIdx === -1) {
    throw new Error(
      `Members table not found: heading "${MEMBERS_HEADING}" missing`,
    );
  }

  // Find the table inside this section: header row + separator + body.
  // Insert position = first non-table line after the body (or EOF).
  let insertIdx = -1;
  let inTable = false;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    const t = (lines[i] ?? "").trim();
    if (t.startsWith("|")) {
      inTable = true;
      continue;
    }
    if (inTable) {
      insertIdx = i;
      break;
    }
  }
  if (insertIdx === -1) {
    insertIdx = lines.length;
  }

  const row =
    `| ${escapeMdCell(input.name)} | @${input.githubHandle} ` +
    `| ${input.telegram} | ${input.link} | ${escapeMdCell(input.focus)} |`;

  const out = [...lines.slice(0, insertIdx), row, ...lines.slice(insertIdx)];
  return out.join("\n");
}
