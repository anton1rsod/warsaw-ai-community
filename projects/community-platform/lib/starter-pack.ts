import { z } from "zod";
import matter from "gray-matter";
import { promises as fs } from "node:fs";

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

/**
 * Reads + parses `community/starter-pack.md`. Throws on read error or
 * schema mismatch. Caller is responsible for catching at the boundary.
 *
 * @param absolutePath - resolved path to the starter-pack.md file
 */
export async function loadStarterPack(absolutePath: string): Promise<StarterPack> {
  let raw: string;
  try {
    raw = await fs.readFile(absolutePath, "utf8");
  } catch (err) {
    throw new Error(
      `loadStarterPack: cannot read ${absolutePath} — ${err instanceof Error ? err.message : "unknown error"}`,
    );
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (err) {
    throw new Error(
      `loadStarterPack: invalid YAML frontmatter in starter-pack.md — ${err instanceof Error ? err.message : "unknown error"}`,
    );
  }

  const result = StarterPackSchema.safeParse(parsed.data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`loadStarterPack: schema mismatch — ${issues}`);
  }

  return result.data;
}
