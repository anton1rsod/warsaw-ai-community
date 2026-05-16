#!/usr/bin/env tsx
// Sandbox calibration: builds an index from the fixture corpus in a temp dir,
// then scores the seed query set against it. Use when the real staging
// archive is too thin for meaningful calibration (cf. plan §15.1 + spec §9.3
// OQ-1). Requires GEMINI_API_KEY. Produces a SUGGESTED THRESHOLD line.
//
// Run: pnpm tsx scripts/calibrate-fixtures.ts
import { readFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { buildIndex } from "./build-index";
import { embed } from "../src/ai/gateway";
import { topK } from "../src/retrieval/cosine";
import { IndexFileSchema } from "../src/retrieval/schema";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(scriptDir, "..");
const fixtureArchive = path.join(appDir, "tests", "fixtures", "archive");
const queriesPath = path.join(appDir, "tests", "fixtures", "calibration-queries.json");

async function main() {
  if (!existsSync(fixtureArchive)) {
    throw new Error(`Fixture archive missing at ${fixtureArchive}`);
  }

  const sandbox = path.join(os.tmpdir(), `gbrain-calibrate-${process.pid}`);
  const sandboxArchive = path.join(sandbox, "community", "archive");
  rmSync(sandbox, { recursive: true, force: true });
  mkdirSync(sandboxArchive, { recursive: true });
  cpSync(fixtureArchive, sandboxArchive, { recursive: true });
  console.log(`[calibrate-fixtures] sandbox: ${sandbox}`);

  try {
    await buildIndex({ repoRoot: sandbox, workflowRunId: "sandbox" });

    const indexPath = path.join(sandboxArchive, "_index", "index.json");
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
      const n = queries.positive.length + queries.negative.length;
      console.log(`\nSUGGESTED THRESHOLD (sandbox, N=${n}): ${threshold.toFixed(3)}`);
      console.log("Apply via: edit ASK_SIMILARITY_THRESHOLD in src/commands/ask.ts");
    } else {
      console.log("\nWARNING: positive and negative score ranges overlap — expand seed query set in tests/fixtures/calibration-queries.json or expand fixture archive.");
    }
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
