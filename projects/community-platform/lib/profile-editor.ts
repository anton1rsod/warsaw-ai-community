import matter from "gray-matter";
import { z } from "zod";

/**
 * The required frontmatter keys for a member profile file.
 *
 * Order is significant — composeProfile re-serializes frontmatter via
 * gray-matter, and gray-matter preserves insertion order of the data object's
 * keys. Existing v0.1 files have these keys in this order; preserve it.
 */
export const REQUIRED_FRONTMATTER_KEYS = [
  "name",
  "github_handle",
  "consented_at",
] as const;

export type FrontmatterRecord = Record<string, unknown>;

/**
 * H18: 64KB cap prevents commit-size DoS + display perf issues.
 */
export const SaveProfileSchema = z.object({
  body: z.string().max(65_536, "Profile body too large (max 64KB)"),
});

export type SaveProfileInput = z.infer<typeof SaveProfileSchema>;

export type SaveErrorCode =
  | "not_authenticated"
  | "not_a_member"
  | "invalid_body"
  | "file_missing"
  | "frontmatter_corrupt"
  | "sha_conflict"
  | "refresh_needed"
  | "unknown";

export type SaveResult =
  | { ok: true; savedAt: string }
  | { ok: false; error: SaveErrorCode };

export interface ParsedProfile {
  data: FrontmatterRecord;
  body: string;
}

export function parseFrontmatter(content: string): ParsedProfile {
  const parsed = matter(content);
  // gray-matter / js-yaml auto-coerces ISO-8601 timestamps to Date objects.
  // Convert them back to strings so callers get a stable FrontmatterRecord of
  // string values (H19: frontmatter values must survive round-trips unchanged).
  const data: FrontmatterRecord = Object.fromEntries(
    Object.entries(parsed.data).map(([k, v]) => [
      k,
      v instanceof Date ? v.toISOString() : v,
    ]),
  );
  return { data, body: parsed.content };
}

export function serializeFrontmatter(
  data: FrontmatterRecord,
  body: string,
): string {
  return matter.stringify(body, data);
}

/**
 * H19: frontmatter integrity across edits.
 *
 * Preserves required keys + any non-required keys verbatim; replaces only the
 * body. Caller (`saveProfile` server action) MUST verify required keys are
 * present BEFORE calling composeProfile — composeProfile assumes integrity.
 */
export function composeProfile(
  data: FrontmatterRecord,
  newBody: string,
): string {
  return serializeFrontmatter(data, newBody);
}

export function hasRequiredFrontmatter(data: FrontmatterRecord): boolean {
  return REQUIRED_FRONTMATTER_KEYS.every(
    (k) => typeof data[k] === "string" && (data[k] as string).length > 0,
  );
}
