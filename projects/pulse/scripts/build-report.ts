import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { loadPortfolio } from "../lib/sources/portfolio.js";
import { loadDecisions } from "../lib/sources/decisions.js";
import { loadReleases } from "../lib/sources/shipping.js";
import { loadEngagement } from "../lib/sources/engagement.js";
import { loadRootState } from "../lib/sources/states.js";
import { buildMonthlyReview, type MonthlyReviewInput } from "../lib/reports/monthly.js";
import { REPO_ROOT } from "../lib/sources/repo-io.js";

export async function gatherMonthlyInput(repoRoot: string, period: string, generatedAt: string): Promise<MonthlyReviewInput> {
  const [projects, decisions, releases, engagement, state] = await Promise.all([
    loadPortfolio(repoRoot),
    loadDecisions(repoRoot),
    loadReleases(repoRoot),
    loadEngagement(repoRoot),
    loadRootState(repoRoot),
  ]);
  return { period, generatedAt, projects, releases, decisions, engagement, state };
}

export async function writeMonthlyReview(repoRoot: string, period: string, generatedAt: string): Promise<string> {
  const md = buildMonthlyReview(await gatherMonthlyInput(repoRoot, period, generatedAt));
  const outDir = path.join(repoRoot, "docs/playbooks");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "monthly-review.md");
  await writeFile(outPath, md, "utf8");
  return outPath;
}

function argOf(flag: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`${flag}=`));
  return hit?.split("=")[1];
}

async function main(): Promise<void> {
  const period = argOf("--period") ?? "monthly";
  if (period === "weekly") throw new Error("weekly digest is deferred (spec O2); only --period=monthly is supported");
  if (period !== "monthly") throw new Error(`unknown --period=${period} (expected monthly)`);
  const now = new Date();
  const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const outPath = await writeMonthlyReview(REPO_ROOT, ym, now.toISOString());
  console.log(`pulse: wrote ${outPath}`);
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  });
}
