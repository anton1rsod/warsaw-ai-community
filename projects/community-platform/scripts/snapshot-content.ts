import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readGovernance } from "@/lib/governance";
import { readRoster, readMemberProfile, readMemberPersona } from "@/lib/roster";
import { listProjects, readProject, type ProjectDetail } from "@/lib/projects";

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

  const [roster, governance, projectSummaries] = await Promise.all([
    readRoster(rosterPath),
    readGovernance({ adminsPath, cmsPath }),
    listProjects(REPO_ROOT),
  ]);

  const [members, projects] = await Promise.all([
    Promise.all(
      roster.map(async (m) => {
        const [profile, persona] = await Promise.all([
          readMemberProfile(REPO_ROOT, m.slug),
          readMemberPersona(REPO_ROOT, m.slug),
        ]);
        return { ...m, profile, persona };
      }),
    ),
    Promise.all(
      projectSummaries.map((p) => readProject(REPO_ROOT, p.slug) as Promise<ProjectDetail>),
    ),
  ]);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    members,
    governance: {
      admins: governance.admins,
      communityManagers: governance.communityManagers,
    },
    projects,
  };

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(snapshot, null, 2) + "\n", "utf-8");


  console.log(
    `[snapshot] wrote ${path.relative(REPO_ROOT, OUTPUT)}\n` +
      `  members: ${members.length} (${members.filter((m) => m.profile !== null).length} with profile)\n` +
      `  admins: ${governance.admins.length}\n` +
      `  CMs: ${governance.communityManagers.length}\n` +
      `  projects: ${projects.length}`,
  );
}

main().catch((err: unknown) => {

  console.error("[snapshot] failed:", err);
  process.exit(1);
});
