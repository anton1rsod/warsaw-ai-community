import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Adr, Engagement, Project, Release } from "../lib/types.js";
import { makeClient, resolveDataSourceId, type MirrorClient, type RetrievableClient } from "../lib/notion/client.js";
import { createThrottle, type Throttle } from "../lib/notion/throttle.js";
import { readIndex, writeIndex, createIndexStore, type IndexStore } from "../lib/notion/index-store.js";
import { projectProps, decisionProps, releaseProps, engagementProps } from "../lib/notion/mappers.js";
import { upsertMany } from "../lib/notion/upsert.js";
import { loadPortfolio } from "../lib/sources/portfolio.js";
import { loadDecisions } from "../lib/sources/decisions.js";
import { loadReleases } from "../lib/sources/shipping.js";
import { loadEngagement } from "../lib/sources/engagement.js";
import { REPO_ROOT } from "../lib/sources/repo-io.js";

export interface SyncDeps {
  mirrorClient: MirrorClient & RetrievableClient;
  dbIds: { projects: string; decisions: string; shipping: string; engagement: string };
  data: { projects: Project[]; decisions: Adr[]; releases: Release[]; engagement: Engagement[] };
  store: IndexStore;
  throttle: Throttle;
  syncedAt: string;
  repoUrl: string;
}

export async function runSync(deps: SyncDeps): Promise<void> {
  const { mirrorClient, dbIds, data, store, throttle, syncedAt, repoUrl } = deps;

  const [dsProjects, dsDecisions, dsShipping, dsEngagement] = await Promise.all([
    resolveDataSourceId(mirrorClient, dbIds.projects),
    resolveDataSourceId(mirrorClient, dbIds.decisions),
    resolveDataSourceId(mirrorClient, dbIds.shipping),
    resolveDataSourceId(mirrorClient, dbIds.engagement),
  ]);

  await upsertMany(mirrorClient, throttle, store, "projects", dsProjects, data.projects.map((p) => projectProps(p, syncedAt)));
  await upsertMany(mirrorClient, throttle, store, "decisions", dsDecisions, data.decisions.map((a) => decisionProps(a, syncedAt, repoUrl)));
  await upsertMany(mirrorClient, throttle, store, "shipping", dsShipping, data.releases.map((r) => releaseProps(r, syncedAt)));
  await upsertMany(mirrorClient, throttle, store, "engagement", dsEngagement, data.engagement.map((e) => engagementProps(e, syncedAt)));
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

async function main(): Promise<void> {
  const token = env("NOTION_TOKEN");
  const dbIds = {
    projects: env("NOTION_DB_PROJECTS"),
    decisions: env("NOTION_DB_DECISIONS"),
    shipping: env("NOTION_DB_SHIPPING"),
    engagement: env("NOTION_DB_ENGAGEMENT"),
  };
  if (!token || !dbIds.projects || !dbIds.decisions || !dbIds.shipping || !dbIds.engagement) {
    console.log("pulse: NOTION_TOKEN or a DB id is unset — skipping mirror (graceful no-op).");
    return;
  }

  const indexPath = path.join(REPO_ROOT, "projects/pulse/notion-index.json");
  const store = createIndexStore(await readIndex(indexPath));
  const [projects, decisions, releases, engagement] = await Promise.all([
    loadPortfolio(REPO_ROOT), loadDecisions(REPO_ROOT), loadReleases(REPO_ROOT), loadEngagement(REPO_ROOT),
  ]);

  await runSync({
    mirrorClient: makeClient(token) as unknown as MirrorClient & RetrievableClient,
    dbIds: dbIds as { projects: string; decisions: string; shipping: string; engagement: string },
    data: { projects, decisions, releases, engagement },
    store,
    throttle: createThrottle({ concurrency: 2 }),
    syncedAt: new Date().toISOString(),
    repoUrl: env("GITHUB_REPO_URL") ?? "",
  });

  await writeIndex(indexPath, store.snapshot());
  console.log("pulse: mirror complete; notion-index.json updated.");
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err: unknown) => { console.error(err); process.exitCode = 1; });
}
