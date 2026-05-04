import { yamlString } from "@/lib/yaml-string";

export interface ConsentMarkdownInput {
  /** Display name as it should appear in the frontmatter `name:` field. */
  readonly name: string;
  /** GitHub handle, lowercase, no leading `@`. */
  readonly githubHandle: string;
}

/**
 * Render the canonical member profile + consent file body.
 *
 * Format (byte-for-byte v0.1.0-compatible except for `name:` quoting):
 *
 *   ---
 *   name: "<yaml-safe display name>"
 *   github_handle: <handle>
 *   consented_at: "<ISO 8601 UTC>"
 *   ---
 *
 *   _Profile prose to come — open a PR to fill this in._
 *
 * Both `app/actions/consent.ts` (first-login consent) and
 * `lib/invitations.ts:redeemInvitation` (invitation redemption) consume
 * this helper. H11: `name` and `consented_at` always quoted (yamlString)
 * to avoid YAML 1.1 implicit-typing pitfalls (spec §11.4, §11.5 H11).
 *
 * `consented_at` is captured here (`new Date().toISOString()`) so the
 * helper is the single source of timestamp truth across both flows.
 * Tests use `vi.useFakeTimers()` for determinism.
 */
export function generateConsentMarkdown(
  input: ConsentMarkdownInput,
): string {
  const consentedAt = new Date().toISOString();
  return [
    "---",
    `name: ${yamlString(input.name)}`,
    `github_handle: ${input.githubHandle}`,
    `consented_at: ${yamlString(consentedAt)}`,
    "---",
    "",
    "_Profile prose to come — open a PR to fill this in._",
    "",
  ].join("\n");
}
