#!/usr/bin/env tsx
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { chunkMarkdown } from "../src/retrieval/chunk";
import { IndexFileSchema, type IndexEntry, type Manifest } from "../src/retrieval/schema";
import { embed } from "../src/ai/gateway";
import { buildGitHubBlobLink } from "../src/retrieval/cite";

const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];

interface BuildOpts {
  repoRoot: string;
  workflowRunId?: string;
}

interface FrontmatterMeta {
  authorHandle: string;
  topic: string;
  timestamp: string;
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n/;

function parseFrontmatter(source: string): FrontmatterMeta | null {
  const m = source.match(FRONTMATTER_RE);
  if (!m) return null;
  const yaml = m[1] ?? "";
  const author = yaml.match(/author:\s*"?([^"\n]+)"?/)?.[1] ?? "@unknown";
  const topic = yaml.match(/topic:\s*"?([^"\n]+)"?/)?.[1] ?? "unknown";
  const ts = yaml.match(/timestamp:\s*"?([^"\n]+)"?/)?.[1] ?? new Date().toISOString();
  return { authorHandle: author.trim(), topic: topic.trim(), timestamp: ts.trim() };
}

function* walkArchive(repoRoot: string): Generator<string> {
  const root = path.join(repoRoot, "community", "archive");
  function* recurse(dir: string): Generator<string> {
    if (!statSync(dir, { throwIfNoEntry: false })) return;
    for (const entry of readdirSync(dir)) {
      if (entry === "_index" || entry === "_removed") continue;
      const full = path.join(dir, entry);
      const s = statSync(full);
      if (s.isDirectory()) yield* recurse(full);
      else if (entry.endsWith(".md")) yield full;
    }
  }
  yield* recurse(root);
}

function assertAllowedPath(p: string, repoRoot: string): void {
  const allowed = path.join(repoRoot, "community", "archive", "_index");
  if (!path.normalize(p).startsWith(allowed)) {
    throw new Error(`assertAllowedPath: refused to write outside ${allowed}: ${p}`);
  }
}

async function embedWithRetry(text: string): Promise<number[] | { error: string }> {
  let lastErr = "";
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await embed(text);
    } catch (e: unknown) {
      lastErr = e instanceof Error ? e.message : "unknown";
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt] ?? 4000));
      }
    }
  }
  return { error: lastErr };
}

export async function buildIndex(opts: BuildOpts): Promise<void> {
  const { repoRoot, workflowRunId = "local" } = opts;
  const startMs = Date.now();
  const indexDir = path.join(repoRoot, "community", "archive", "_index");
  const indexFile = path.join(indexDir, "index.json");
  const manifestFile = path.join(indexDir, "manifest.json");

  let priorByKey: Map<string, IndexEntry> = new Map();
  if (statSync(indexFile, { throwIfNoEntry: false })) {
    try {
      const prior = IndexFileSchema.parse(JSON.parse(readFileSync(indexFile, "utf8")));
      priorByKey = new Map(prior.map((e) => [`${e.source_path}:${e.chunk_hash}`, e]));
    } catch (e) {
      console.warn("[build-index] prior index unparseable; full rebuild");
    }
  }

  const newEntries: IndexEntry[] = [];
  const failedChunks: { source_path: string; chunk_hash: string; reason: string }[] = [];
  let generated = 0;
  let reused = 0;
  let sourceFiles = 0;

  for (const file of walkArchive(repoRoot)) {
    sourceFiles++;
    const source = readFileSync(file, "utf8");
    const meta = parseFrontmatter(source) ?? { authorHandle: "@unknown", topic: "unknown", timestamp: new Date().toISOString() };
    const relPath = path.relative(repoRoot, file).replace(/\\/g, "/");
    const chunks = chunkMarkdown(source);

    for (const chunk of chunks) {
      const key = `${relPath}:${chunk.hash}`;
      const prior = priorByKey.get(key);
      let embedding: number[];
      if (prior) {
        embedding = prior.embedding;
        reused++;
      } else {
        const preamble = `This is a ${meta.topic}-topic message archived on ${meta.timestamp.slice(0, 10)} by ${meta.authorHandle}: `;
        const embedResult = await embedWithRetry(preamble + chunk.content);
        if (Array.isArray(embedResult)) {
          embedding = embedResult;
          generated++;
        } else {
          failedChunks.push({ source_path: relPath, chunk_hash: chunk.hash, reason: embedResult.error });
          continue;
        }
      }

      const id = createHash("sha256").update(`${relPath}:${chunk.hash}`, "utf8").digest("hex");
      const sourceLink = buildGitHubBlobLink({
        owner: process.env.GITHUB_REPO_OWNER ?? "warsaw-ai",
        repo: process.env.GITHUB_REPO_NAME ?? "community",
        branch: process.env.GITHUB_DEFAULT_BRANCH ?? "main",
        sourcePath: relPath,
        lineRange: chunk.lineRange
      });

      newEntries.push({
        id,
        source_path: relPath,
        source_lines: chunk.lineRange,
        chunk_hash: chunk.hash,
        embedding,
        content_preview: chunk.content.slice(0, 240),
        metadata: {
          author_handle: meta.authorHandle,
          topic: meta.topic,
          timestamp_iso: meta.timestamp,
          source_link: sourceLink
        }
      });
    }
  }

  const manifest: Manifest = {
    built_at: new Date().toISOString(),
    built_by_workflow: workflowRunId,
    embedding_model: "gemini-embedding-001",
    embedding_dim: 768,
    source_files_hash: createHash("sha256").update(newEntries.map((e) => e.id).sort().join(",")).digest("hex"),
    schema_version: 1,
    stats: {
      total_chunks: newEntries.length,
      total_source_files: sourceFiles,
      total_embeddings_generated_this_run: generated,
      total_embeddings_reused_this_run: reused,
      total_embeddings_failed_this_run: failedChunks.length,
      embed_failed_chunks: failedChunks,
      build_ms: Date.now() - startMs
    }
  };

  mkdirSync(indexDir, { recursive: true });
  assertAllowedPath(indexFile, repoRoot);
  assertAllowedPath(manifestFile, repoRoot);
  writeFileSync(indexFile, JSON.stringify(newEntries, null, 0));
  writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

  if (failedChunks.length > 0) {
    console.warn(`[build-index] ${failedChunks.length} chunks failed to embed:`);
    for (const f of failedChunks) console.warn(`  ${f.source_path} ${f.chunk_hash.slice(0, 8)}: ${f.reason}`);
  }
  console.log(`[build-index] ${newEntries.length} chunks (${generated} new, ${reused} reused, ${failedChunks.length} failed) in ${manifest.stats.build_ms}ms`);
}

if (import.meta.url === `file://${process.argv[1] ?? ""}`) {
  const repoRoot = path.resolve(new URL(import.meta.url).pathname, "..", "..", "..", "..");
  buildIndex({ repoRoot, workflowRunId: process.env.GITHUB_RUN_ID ?? "local" })
    .catch((e) => { console.error(e); process.exit(1); });
}
