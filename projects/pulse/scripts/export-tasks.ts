import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { makeClient, resolveDataSourceId, type ExportClient, type RetrievableClient } from "../lib/notion/client.js";
import { createThrottle, type Throttle } from "../lib/notion/throttle.js";
import { exportTasks } from "../lib/notion/export-tasks.js";
import { REPO_ROOT } from "../lib/sources/repo-io.js";

export interface TaskExportDeps {
  exportClient: ExportClient;
  retrievableClient: RetrievableClient;
  tasksDbId: string;
  throttle: Throttle;
  outPath: string;
}

export async function runTaskExport(deps: TaskExportDeps): Promise<unknown[]> {
  const dsId = await resolveDataSourceId(deps.retrievableClient, deps.tasksDbId);
  const rows = await exportTasks(deps.exportClient, dsId, deps.throttle);
  await mkdir(path.dirname(deps.outPath), { recursive: true });
  await writeFile(deps.outPath, JSON.stringify({ count: rows.length, rows }, null, 2) + "\n", "utf8");
  return rows;
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

async function main(): Promise<void> {
  const token = env("NOTION_READ_TOKEN");
  const tasksDbId = env("NOTION_DB_TASKS");
  if (!token || !tasksDbId) {
    console.log("pulse: NOTION_READ_TOKEN or NOTION_DB_TASKS unset — skipping export (graceful no-op).");
    return;
  }
  const client = makeClient(token);
  const rows = await runTaskExport({
    exportClient: client as unknown as ExportClient,
    retrievableClient: client as unknown as RetrievableClient,
    tasksDbId,
    throttle: createThrottle({ concurrency: 2 }),
    outPath: path.join(REPO_ROOT, "projects/pulse/snapshots/tasks-snapshot.json"),
  });
  console.log(`pulse: exported ${rows.length} tasks → snapshots/tasks-snapshot.json`);
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err: unknown) => { console.error(err); process.exitCode = 1; });
}
