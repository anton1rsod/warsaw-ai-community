import { readFile } from "node:fs/promises";

const EMAIL_HEADER = /^git\s*email$/i;
const HANDLE_HEADER = /^github(\s*handle)?$/i;
const SEPARATOR_ROW = /^\|[\s\-|:]+\|$/;
const TBD_MARKER = "*(TBD)*";

function parseCells(line: string): string[] {
  const inner = line.replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((c) => c.trim());
}

/**
 * Parse a markdown file into an `email → handle` Map.
 *
 * Header-aware: locates the alias table by `Git email` + `GitHub handle`
 * column headers (case-insensitive, optional whitespace) so other tables in
 * the same file are ignored. Mirrors `lib/roster.ts` so reader expectations
 * stay consistent across the two member-data parsers.
 *
 * Both keys and values are lowercased: git author emails carry no canonical
 * case, and roster handles are stored lowercase, so case-insensitive match is
 * the only correct semantic.
 */
export function parseAliases(content: string): Map<string, string> {
  const aliases = new Map<string, string>();
  const lines = content.split("\n");

  let pendingHeader: string[] | null = null;
  let emailColIndex = -1;
  let handleColIndex = -1;
  let inTableBody = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line.startsWith("|")) {
      pendingHeader = null;
      emailColIndex = -1;
      handleColIndex = -1;
      inTableBody = false;
      continue;
    }

    if (SEPARATOR_ROW.test(line)) {
      if (pendingHeader !== null) {
        emailColIndex = pendingHeader.findIndex((h) => EMAIL_HEADER.test(h));
        handleColIndex = pendingHeader.findIndex((h) => HANDLE_HEADER.test(h));
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

    if (emailColIndex === -1 || handleColIndex === -1) continue;

    const emailCell = cells[emailColIndex] ?? "";
    const handleCell = cells[handleColIndex] ?? "";

    if (
      emailCell === "" ||
      handleCell === "" ||
      emailCell.includes(TBD_MARKER) ||
      handleCell.includes(TBD_MARKER)
    ) {
      continue;
    }

    aliases.set(
      emailCell.toLowerCase(),
      handleCell.replace(/^@/, "").toLowerCase(),
    );
  }

  return aliases;
}

/**
 * Resolve a git author email to a GitHub handle for matching against roster
 * `github_handle` values (lowercase, no leading `@`).
 *
 * Order: explicit alias → GitHub noreply pattern (`<id>+<handle>@…` or
 * `<handle>@…`) → local-part fallback. Authors whose resolved handle isn't on
 * the roster are silently dropped by `computeContributions`, so the local-part
 * fallback only credits members whose git author email's local-part already
 * happens to match their roster handle.
 */
export function resolveHandle(
  email: string,
  aliases: ReadonlyMap<string, string>,
): string {
  const lower = email.toLowerCase();
  const aliased = aliases.get(lower);
  if (aliased !== undefined) return aliased;
  const localPart = lower.replace(/@.*/, "");
  return localPart.replace(/^\d+\+/, "");
}

/**
 * Read aliases from disk. Missing file → empty map: the alias mechanism is a
 * soft enhancement layered over the noreply / local-part heuristics.
 */
export async function readAliases(
  filePath: string,
): Promise<Map<string, string>> {
  try {
    const content = await readFile(filePath, "utf-8");
    return parseAliases(content);
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT"
    ) {
      return new Map();
    }
    throw err;
  }
}
