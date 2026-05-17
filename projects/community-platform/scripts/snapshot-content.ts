import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readGovernance } from "@/lib/governance";
import { readRoster, readMemberProfile, readMemberPersona } from "@/lib/roster";
import { listProjects, readProject } from "@/lib/projects";
import { listDecisions, readDecision } from "@/lib/decisions";
import { listMeetingsFromDisk } from "@/lib/meetings";
import { main as buildEventRosters } from "./build-event-rosters";
import { main as buildKudos } from "./build-kudos-aggregate";
// build-calendar is dynamically imported AFTER content-snapshot.json is written —
// it transitively loads lib/content-snapshot.ts which imports the JSON at module
// load time. buildEventRosters + buildKudos read community/*.md directly so they
// don't share this constraint. See GOTCHAS row 10.

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

  const [roster, governance, projectSummaries, decisionSummaries, meetings] =
    await Promise.all([
      readRoster(rosterPath),
      readGovernance({ adminsPath, cmsPath }),
      listProjects(REPO_ROOT),
      listDecisions(REPO_ROOT),
      listMeetingsFromDisk(REPO_ROOT),
    ]);

  const [members, projects, decisions] = await Promise.all([
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
      projectSummaries.map(async (p) => {
        const proj = await readProject(REPO_ROOT, p.slug);
        if (!proj) {
          throw new Error(
            `[snapshot] readProject returned null for slug "${p.slug}" — listProjects/readProject contract violation`,
          );
        }
        return proj;
      }),
    ),
    Promise.all(
      decisionSummaries.map(async (d) => {
        const dec = await readDecision(REPO_ROOT, d.slug);
        if (!dec) {
          throw new Error(
            `[snapshot] readDecision returned null for slug "${d.slug}" — listDecisions/readDecision contract violation`,
          );
        }
        return dec;
      }),
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
    decisions,
    meetings,
  };

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(snapshot, null, 2) + "\n", "utf-8");

  buildEventRosters();
  buildKudos();
  // Dynamic import: build-calendar transitively reads content-snapshot.json, which
  // only exists after the writeFile above.
  const { main: buildCalendar } = await import("./build-calendar");
  buildCalendar();

  console.log(
    `[snapshot] wrote ${path.relative(REPO_ROOT, OUTPUT)}\n` +
      `  members: ${members.length} (${members.filter((m) => m.profile !== null).length} with profile)\n` +
      `  admins: ${governance.admins.length}\n` +
      `  CMs: ${governance.communityManagers.length}\n` +
      `  projects: ${projects.length}\n` +
      `  decisions: ${decisions.length}\n` +
      `  meetings: ${meetings.length}`,
  );
}

main().catch((err: unknown) => {

  console.error("[snapshot] failed:", err);
  process.exit(1);
});
