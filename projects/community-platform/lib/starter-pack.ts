import { z } from "zod";

/**
 * v0.10.0 Phase B — Starter Pack
 *
 * Curated 3–5 (1–8 enforced) artifact references shown to signed-in
 * members on `/home` above the HomeFeed. Source-of-truth lives in
 * `community/starter-pack.md` frontmatter; this module parses it,
 * validates the schema (H114), and resolves slugs to render-ready data.
 */

const ARTIFACT_TYPES = ["decision", "project", "event", "status", "member"] as const;
export type StarterPackArtifactType = (typeof ARTIFACT_TYPES)[number];

export const StarterPackItemSchema = z.object({
  type: z.enum(ARTIFACT_TYPES),
  slug: z.string().min(1),
});

export type StarterPackItem = z.infer<typeof StarterPackItemSchema>;

export const StarterPackSchema = z.object({
  items: z.array(StarterPackItemSchema).min(1).max(8),
});

export type StarterPack = z.infer<typeof StarterPackSchema>;
