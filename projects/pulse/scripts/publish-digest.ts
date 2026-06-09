import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeClient } from "../lib/notion/client.js";
import { createThrottle } from "../lib/notion/throttle.js";
import { readIndex, writeIndex, createIndexStore } from "../lib/notion/index-store.js";
import { publishDigest, type DigestClient } from "../lib/notion/digest.js";
import { buildMonthlyReview } from "../lib/reports/monthly.js";
import { gatherMonthlyInput } from "./build-report.js";
import { REPO_ROOT } from "../lib/sources/repo-io.js";

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

async function main(): Promise<void> {
  const token = env("NOTION_TOKEN");
  const parent = env("NOTION_DIGEST_PAGE");
  if (!token || !parent) {
    console.log("pulse: NOTION_TOKEN or NOTION_DIGEST_PAGE unset — skipping digest page (graceful no-op).");
    return;
  }
  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const markdown = buildMonthlyReview(await gatherMonthlyInput(REPO_ROOT, period, now.toISOString()));
  const label = /^#\s+(.+)$/m.exec(markdown)?.[1] ?? `Monthly Review — ${period}`;

  const indexPath = path.join(REPO_ROOT, "projects/pulse/notion-index.json");
  const store = createIndexStore(await readIndex(indexPath));
  await publishDigest(makeClient(token) as unknown as DigestClient, createThrottle({ concurrency: 2 }), store, parent, period, label, markdown);
  await writeIndex(indexPath, store.snapshot());
  console.log("pulse: digest page published.");
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err: unknown) => { console.error(err); process.exitCode = 1; });
}
