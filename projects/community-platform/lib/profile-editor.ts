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
 * H16: expectedSha is the SHA the client loaded at /me/edit render time —
 * the server rejects with refresh_needed when it doesn't match the current
 * file SHA, closing the v0.2.0 lost-update window where the retry-on-409
 * loop silently overwrote concurrent commits.
 */
export const SaveProfileSchema = z.object({
  body: z.string().max(65_536, "Profile body too large (max 64KB)"),
  expectedSha: z.string().min(1, "expectedSha required"),
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

// ───────────────────────────────────────────────────────────────────────────
// v0.3 frontmatter extensions — RSVP + Thanks.
//
// `parseFrontmatter` / `serializeFrontmatter` / `composeProfile` v0.2 surfaces
// stay unchanged. v0.3 callers use `parseProfileFrontmatter` for typed access
// and `composeProfile` (existing) for serialization.
// ───────────────────────────────────────────────────────────────────────────

export const ThanksRecordSchema = z.object({
  recipient: z.string().min(1),
  item_type: z.enum(["status", "contribution", "meeting"]),
  item_id: z.string().min(1),
  given_at: z.string().datetime(),
});

export type ThanksRecord = z.infer<typeof ThanksRecordSchema>;

export const ProfileFrontmatterSchema = z
  .object({
    events_going: z.array(z.string()).default([]),
    events_interested: z.array(z.string()).default([]),
    event_rsvp_visibility: z.enum(["public", "members_only"]).default("members_only"),
    thanks_given: z.array(ThanksRecordSchema).default([]),
  })
  .passthrough(); // preserve v0.2 fields (name, github_handle, etc.) verbatim

export type ProfileFrontmatter = z.infer<typeof ProfileFrontmatterSchema>;

export function parseProfileFrontmatter(content: string): {
  fm: ProfileFrontmatter;
  body: string;
} {
  const parsed = parseFrontmatter(content);
  const fm = ProfileFrontmatterSchema.parse(parsed.data);
  return { fm, body: parsed.body };
}

/**
 * D11 (spec §13.4.3): For any event slug, member is in EITHER events_going OR
 * events_interested — never both. Server actions enforce on every write via
 * reconcileArrays(); this validator surfaces violations during parse/test
 * fixtures so we never persist a violating profile.
 */
export function validateProfileInvariants(
  fm: Partial<ProfileFrontmatter>,
): void {
  const going = new Set(fm.events_going ?? []);
  for (const slug of fm.events_interested ?? []) {
    if (going.has(slug)) {
      throw new Error(
        `Profile invariant violation (D11): event slug "${slug}" present in both events_going and events_interested`,
      );
    }
  }
}

/**
 * D19 (spec §13.13.4): Derive the ThankButton's initial state for the visitor
 * looking at a given (recipient, item_type, item_id) triple.
 *
 * - viewer not signed in → "not-signed-in" (renders sign-in CTA)
 * - viewer === recipient → "self" (component returns null — no self-thank)
 * - viewer's profile already has the triple → "thanked" (idempotent display)
 * - otherwise → "not-thanked" (clickable)
 */
export function deriveThankInitialState(
  viewerSlug: string | undefined,
  recipient: string,
  itemType: "status" | "contribution" | "meeting",
  itemId: string,
  viewerProfile: ProfileFrontmatter | undefined,
): "thanked" | "not-thanked" | "not-signed-in" | "self" {
  if (!viewerSlug) return "not-signed-in";
  if (viewerSlug === recipient) return "self";
  const has = (viewerProfile?.thanks_given ?? []).some(
    (t) => t.recipient === recipient && t.item_type === itemType && t.item_id === itemId,
  );
  return has ? "thanked" : "not-thanked";
}
