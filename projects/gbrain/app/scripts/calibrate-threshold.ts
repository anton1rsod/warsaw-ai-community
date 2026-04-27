#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { embed } from "../src/ai/gateway";
import { topK } from "../src/retrieval/cosine";
import { IndexFileSchema } from "../src/retrieval/schema";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.resolve(scriptDir, "..", "..", "..", "..", "community", "archive", "_index", "index.json");
const queriesPath = path.resolve(scriptDir, "..", "tests", "fixtures", "calibration-queries.json");

async function main() {
  const index = IndexFileSchema.parse(JSON.parse(readFileSync(indexPath, "utf8")));
  const queries = JSON.parse(readFileSync(queriesPath, "utf8")) as {
    positive: { query: string; expected_chunk_pattern: string }[];
    negative: { query: string }[];
  };

  const positiveScores: number[] = [];
  for (const q of queries.positive) {
    const e = await embed(q.query);
    const top = topK(e, index, 1)[0];
    if (top) positiveScores.push(top.score);
  }
  const negativeScores: number[] = [];
  for (const q of queries.negative) {
    const e = await embed(q.query);
    const top = topK(e, index, 1)[0];
    if (top) negativeScores.push(top.score);
  }

  positiveScores.sort();
  negativeScores.sort((a, b) => b - a);
  console.log("Positive scores (sorted asc):", positiveScores.map((s) => s.toFixed(3)));
  console.log("Negative scores (sorted desc):", negativeScores.map((s) => s.toFixed(3)));
  const minPos = positiveScores[0] ?? 0;
  const maxNeg = negativeScores[0] ?? 0;
  console.log(`\nMin positive: ${minPos.toFixed(3)}`);
  console.log(`Max negative: ${maxNeg.toFixed(3)}`);
  if (minPos > maxNeg) {
    const threshold = (minPos + maxNeg) / 2;
    console.log(`\nSUGGESTED THRESHOLD: ${threshold.toFixed(3)}`);
  } else {
    console.log("\nWARNING: positive and negative score ranges overlap — review queries or expand archive.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
