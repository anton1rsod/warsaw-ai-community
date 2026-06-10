import matter from "gray-matter";
import { z } from "zod";
import type { PersonaFetchError } from "./persona-fetch";

/** H141: 64KB cap (parity with SaveProfileSchema). Single source for schema + client. */
export const PERSONA_MAX_BYTES = 65_536;

// H152 parity: byte-accurate cap. z.string().max() counts UTF-16 code units,
// which admits up to ~3× the intended bytes for non-ASCII content. The fetch
// path (lib/persona-fetch.ts) caps real bytes, so the schema must too.
export const SavePersonaSchema = z.object({
  content: z
    .string()
    .min(1, "empty")
    .refine((c) => new TextEncoder().encode(c).length <= PERSONA_MAX_BYTES, {
      message: "Persona too large (max 64KB)",
    }),
});

export type SavePersonaInput = z.infer<typeof SavePersonaSchema>;

export type PersonaSaveError =
  | "not_authenticated"
  | "not_a_member"
  | "invalid_content"
  | "id_mismatch"
  | "frontmatter_missing"
  | "write_failed"
  // v0.12 GitHub-link attach (H151/H152): the fetch-path kinds share this
  // union so PersonaEditor renders per-kind messages from one switch.
  | PersonaFetchError;

export type PersonaSaveResult =
  | { ok: true; savedAt: string }
  | { ok: false; error: PersonaSaveError };

export type FrontmatterCheck =
  | { ok: true }
  | { ok: false; error: "id_mismatch" | "frontmatter_missing" };

/**
 * H142: the pasted persona's `persona_id` MUST equal the member's slug, and
 * `display_name` + `schema_version` must be present. Prevents a member writing
 * (or overwriting) another member's persona file.
 */
export function validatePersonaFrontmatter(content: string, slug: string): FrontmatterCheck {
  let data: Record<string, unknown>;
  try {
    data = matter(content).data as Record<string, unknown>;
  } catch {
    return { ok: false, error: "frontmatter_missing" };
  }
  const id = data.persona_id;
  const name = data.display_name;
  const ver = data.schema_version;
  if (name === undefined || name === null || String(name).trim() === "") {
    return { ok: false, error: "frontmatter_missing" };
  }
  if (ver === undefined || ver === null || String(ver).trim() === "") {
    return { ok: false, error: "frontmatter_missing" };
  }
  if (typeof id !== "string" || id !== slug) {
    return { ok: false, error: "id_mismatch" };
  }
  return { ok: true };
}
