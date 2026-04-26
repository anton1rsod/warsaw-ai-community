import { z } from "zod";

const HEX64 = /^[0-9a-f]{64}$/;

export const IndexEntrySchema = z.object({
  id: z.string().regex(HEX64),
  source_path: z.string(),
  source_lines: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
  chunk_hash: z.string().regex(HEX64),
  embedding: z.array(z.number()).length(768),
  content_preview: z.string().max(500),
  metadata: z.object({
    author_handle: z.string(),
    topic: z.string(),
    timestamp_iso: z.string(),
    source_link: z.string().url()
  })
});

export type IndexEntry = z.infer<typeof IndexEntrySchema>;

export const IndexFileSchema = z.array(IndexEntrySchema);

export const ManifestSchema = z.object({
  built_at: z.string(),
  built_by_workflow: z.string(),
  embedding_model: z.literal("gemini-embedding-001"),
  embedding_dim: z.literal(768),
  source_files_hash: z.string().regex(HEX64),
  schema_version: z.literal(1),
  stats: z.object({
    total_chunks: z.number().int().nonnegative(),
    total_source_files: z.number().int().nonnegative(),
    total_embeddings_generated_this_run: z.number().int().nonnegative(),
    total_embeddings_reused_this_run: z.number().int().nonnegative(),
    total_embeddings_failed_this_run: z.number().int().nonnegative(),
    embed_failed_chunks: z.array(z.object({
      source_path: z.string(),
      chunk_hash: z.string(),
      reason: z.string()
    })),
    build_ms: z.number().int().nonnegative()
  })
});

export type Manifest = z.infer<typeof ManifestSchema>;
