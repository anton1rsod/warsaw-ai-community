#!/usr/bin/env tsx
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { IndexFileSchema, ManifestSchema } from "../src/retrieval/schema";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..", "..", "..");
const sourceDir = path.join(repoRoot, "community", "archive", "_index");
const targetDir = path.resolve(scriptDir, "..", "data", "_index");

const sourceIndex = path.join(sourceDir, "index.json");
const sourceManifest = path.join(sourceDir, "manifest.json");
const targetIndex = path.join(targetDir, "index.json");
const targetManifest = path.join(targetDir, "manifest.json");

if (!statSync(sourceIndex, { throwIfNoEntry: false })) {
  console.warn(`[copy-index] no index found at ${sourceIndex} — skipping (run scripts/build-index.ts first)`);
  process.exit(0);
}
if (!statSync(sourceManifest, { throwIfNoEntry: false })) {
  console.error(`[copy-index] manifest missing at ${sourceManifest} — refusing to copy partial state`);
  process.exit(1);
}

const indexRaw = JSON.parse(readFileSync(sourceIndex, "utf8"));
const manifestRaw = JSON.parse(readFileSync(sourceManifest, "utf8"));

IndexFileSchema.parse(indexRaw);
ManifestSchema.parse(manifestRaw);

mkdirSync(targetDir, { recursive: true });
writeFileSync(targetIndex, JSON.stringify(indexRaw));
writeFileSync(targetManifest, JSON.stringify(manifestRaw, null, 2));

console.log(`[copy-index] copied ${indexRaw.length} entries → ${targetIndex}`);
