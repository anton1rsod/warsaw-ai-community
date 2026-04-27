import { readFileSync } from "node:fs";
import path from "node:path";
import { IndexFileSchema, ManifestSchema, type IndexEntry, type Manifest } from "./schema";

export interface LoadedIndex {
  entries: IndexEntry[];
  manifest: Manifest;
}

export interface IndexUnavailable {
  reason: string;
}

let cachedIndex: LoadedIndex | null = null;
let loadFailed = false;
let loadFailReason: string | null = null;

/**
 * Module-level singleton. Loaded once per warm Vercel container.
 * Per spec §3.8 — mirrors the gateway.ts cachedProvider pattern.
 */
export function getIndex(): LoadedIndex | IndexUnavailable {
  if (cachedIndex) return cachedIndex;
  if (loadFailed) return { reason: loadFailReason ?? "index load previously failed" };

  try {
    const dataDir = path.join(process.cwd(), "data", "_index");
    const indexRaw = JSON.parse(readFileSync(path.join(dataDir, "index.json"), "utf8"));
    const manifestRaw = JSON.parse(readFileSync(path.join(dataDir, "manifest.json"), "utf8"));
    const entries = IndexFileSchema.parse(indexRaw);
    const manifest = ManifestSchema.parse(manifestRaw);
    cachedIndex = { entries, manifest };
    return cachedIndex;
  } catch (error: unknown) {
    loadFailed = true;
    loadFailReason = error instanceof Error ? error.message : "unknown index load error";
    console.error("[gbrain.retrieval.load] index load failed:", loadFailReason);
    return { reason: loadFailReason };
  }
}

