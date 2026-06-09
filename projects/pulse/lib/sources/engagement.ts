import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { EngagementSchema, type Engagement, type Member } from "../types.js";
import { readFileOrNull, readJson, listStatusFiles, REPO_ROOT } from "./repo-io.js";
import { trailingStreak } from "./iso-week.js";

export const ContributionsFileSchema = z.record(
  z.string(),
  z.object({
    projectCommits: z.number(),
    adrsFiled: z.number(),
    meetingsAttended: z.number(),
    statusPosts: z.number(),
  }),
);
export type ContributionsFile = z.infer<typeof ContributionsFileSchema>;

export const KudosFileSchema = z.record(z.string(), z.number());
export type KudosFile = z.infer<typeof KudosFileSchema>;

const RosterSideSchema = z.object({ publicSlugs: z.array(z.string()), hiddenCount: z.number() });
export const EventRostersFileSchema = z.record(
  z.string(),
  z.object({ going: RosterSideSchema, interested: RosterSideSchema }),
);
export type EventRostersFile = z.infer<typeof EventRostersFileSchema>;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function cells(row: string): string[] {
  return row.split("|").slice(1, -1).map((c) => c.trim());
}

/** Members with a real GitHub handle (column 1). Skips (TBD)/empty rows. */
export function parseRoster(content: string): Member[] {
  const members: Member[] = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue;
    if (/GitHub/i.test(line) || /^\|\s*-{2,}/.test(line) || /\|\s*---/.test(line)) continue;
    const c = cells(line);
    if (c.length < 2) continue;
    const handle = /@([A-Za-z0-9_-]+)/.exec(c[1] ?? "")?.[1];
    if (!handle) continue; // (TBD) or empty GitHub cell
    const name = (c[0] ?? "").replace(/[*_]/g, "").replace(/\([^)]*\)/g, "").trim();
    if (!name) continue;
    members.push({ name, handle, slug: slugify(name) });
  }
  return members;
}

export interface EngagementInputs {
  members: readonly Member[];
  contributions: ContributionsFile;
  kudos: KudosFile;
  eventRosters: EventRostersFile;
  statusWeeksByHandle: Record<string, string[]>;
}

export function buildEngagement(inputs: EngagementInputs): Engagement[] {
  const { members, contributions, kudos, eventRosters, statusWeeksByHandle } = inputs;
  return members.map((m) => {
    const eventsAttended = Object.values(eventRosters).filter((ev) => {
      // publicSlugs may key by profile slug or handle depending on platform version; match either.
      const going = ev.going.publicSlugs;
      return going.includes(m.slug) || going.includes(m.handle);
    }).length;

    return EngagementSchema.parse({
      handle: m.handle,
      name: m.name,
      contributions: contributions[m.handle]?.projectCommits ?? 0,
      kudos: kudos[m.handle] ?? 0,
      statusStreak: trailingStreak(statusWeeksByHandle[m.handle] ?? []),
      eventsAttended,
    });
  });
}

/** Group status weeks by frontmatter author (handle), across community/status/<week>/*.md. */
async function statusWeeksByHandle(repoRoot: string): Promise<Record<string, string[]>> {
  const files = await listStatusFiles(repoRoot);
  const acc: Record<string, string[]> = {};
  for (const file of files) {
    const content = await readFileOrNull(file);
    if (!content) continue;
    const fm = matter(content).data as { author?: unknown; week?: unknown };
    if (typeof fm.author === "string" && typeof fm.week === "string") {
      (acc[fm.author] ??= []).push(fm.week);
    }
  }
  return acc;
}

export async function loadEngagement(repoRoot = REPO_ROOT): Promise<Engagement[]> {
  const gen = path.join(repoRoot, "projects/community-platform/lib/__generated__");
  const rosterContent = await readFileOrNull(path.join(repoRoot, "community/members/roster.md"));
  if (rosterContent === null) throw new Error("community/members/roster.md not found");

  const contributions = ContributionsFileSchema.parse(await readJson(path.join(gen, "contributions.json")));
  const kudos = KudosFileSchema.parse(await readJson(path.join(gen, "kudos.json")));
  const eventRosters = EventRostersFileSchema.parse(await readJson(path.join(gen, "event-rosters.json")));

  return buildEngagement({
    members: parseRoster(rosterContent),
    contributions,
    kudos,
    eventRosters,
    statusWeeksByHandle: await statusWeeksByHandle(repoRoot),
  });
}
