import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readGovernance } from "@/lib/governance";
import { readRoster } from "@/lib/roster";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const OUTPUT = path.resolve(
  __dirname,
  "../lib/__generated__/content-snapshot.json",
);

async function main(): Promise<void> {
  const rosterPath = path.join(REPO_ROOT, "community/members/roster.md");
  const adminsPath = path.join(REPO_ROOT, "community/governance/admins.md");
  const cmsPath = path.join(
    REPO_ROOT,
    "community/governance/community-managers.md",
  );

  const [roster, governance] = await Promise.all([
    readRoster(rosterPath),
    readGovernance({ adminsPath, cmsPath }),
  ]);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    roster,
    governance: {
      admins: governance.admins,
      communityManagers: governance.communityManagers,
    },
  };

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(snapshot, null, 2) + "\n", "utf-8");

   
  console.log(
    `[snapshot] wrote ${path.relative(REPO_ROOT, OUTPUT)}\n` +
      `  roster: ${roster.length} members\n` +
      `  admins: ${governance.admins.length}\n` +
      `  CMs: ${governance.communityManagers.length}`,
  );
}

main().catch((err: unknown) => {
   
  console.error("[snapshot] failed:", err);
  process.exit(1);
});
