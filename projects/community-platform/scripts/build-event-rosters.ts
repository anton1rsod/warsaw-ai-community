import { writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { EventSlugSchema, type EventSlug } from "../lib/events";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface RosterMemberInput {
  slug: string;
  visibility: "public" | "members_only";
  going: readonly EventSlug[];
  interested: readonly EventSlug[];
}

export interface EventRosterEntry {
  going: { publicSlugs: string[]; hiddenCount: number };
  interested: { publicSlugs: string[]; hiddenCount: number };
}

export type EventRosterMap = Record<string, EventRosterEntry>;

export function aggregateEventRosters(
  members: readonly RosterMemberInput[],
  known: ReadonlySet<EventSlug>,
): EventRosterMap {
  const out: EventRosterMap = {};
  for (const m of members) {
    for (const slug of m.going) {
      if (!known.has(slug)) continue;
      const entry = (out[slug] ??= {
        going: { publicSlugs: [], hiddenCount: 0 },
        interested: { publicSlugs: [], hiddenCount: 0 },
      });
      if (m.visibility === "public") entry.going.publicSlugs.push(m.slug);
      else entry.going.hiddenCount += 1;
    }
    for (const slug of m.interested) {
      if (!known.has(slug)) continue;
      const entry = (out[slug] ??= {
        going: { publicSlugs: [], hiddenCount: 0 },
        interested: { publicSlugs: [], hiddenCount: 0 },
      });
      if (m.visibility === "public") entry.interested.publicSlugs.push(m.slug);
      else entry.interested.hiddenCount += 1;
    }
  }
  for (const slug of Object.keys(out)) {
    const entry = out[slug];
    if (entry) {
      entry.going.publicSlugs.sort();
      entry.interested.publicSlugs.sort();
    }
  }
  return out;
}

export function readMembers(membersDir: string): RosterMemberInput[] {
  if (!existsSync(membersDir)) return [];
  const out: RosterMemberInput[] = [];
  const files = readdirSync(membersDir, { withFileTypes: true });
  for (const f of files) {
    if (!f.isFile() || !f.name.endsWith(".md")) continue;
    if (f.name === "roster.md" || f.name === "git-email-aliases.md") continue;
    const slug = f.name.replace(/\.md$/, "");
    try {
      const { data } = matter(
        readFileSync(path.join(membersDir, f.name), "utf-8"),
      );
      out.push({
        slug,
        visibility:
          data.event_rsvp_visibility === "public" ? "public" : "members_only",
        going: ((data.events_going ?? []) as string[])
          .map((s) => EventSlugSchema.safeParse(s))
          .filter((r) => r.success)
          .map((r) => (r as { success: true; data: EventSlug }).data),
        interested: ((data.events_interested ?? []) as string[])
          .map((s) => EventSlugSchema.safeParse(s))
          .filter((r) => r.success)
          .map((r) => (r as { success: true; data: EventSlug }).data),
      });
    } catch (err) {
      console.warn(
        `[build-event-rosters] skip ${f.name}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  return out;
}

export function readKnownEventSlugs(eventsDir: string): Set<EventSlug> {
  if (!existsSync(eventsDir)) return new Set();
  const known = new Set<EventSlug>();
  for (const f of readdirSync(eventsDir, { withFileTypes: true })) {
    if (!f.isDirectory() || f.name.startsWith("_")) continue;
    const parsed = EventSlugSchema.safeParse(f.name);
    if (parsed.success) known.add(parsed.data);
  }
  return known;
}

export function main(): void {
  const repoRoot = path.resolve(__dirname, "../../..");
  const membersDir = path.join(repoRoot, "community", "members");
  const eventsDir = path.join(repoRoot, "community", "events");
  const outPath = path.resolve(
    __dirname,
    "../lib/__generated__/event-rosters.json",
  );
  const known = readKnownEventSlugs(eventsDir);
  const members = readMembers(membersDir);
  const rosters = aggregateEventRosters(members, known);
  writeFileSync(outPath, JSON.stringify(rosters, null, 2) + "\n", "utf-8");
  console.log(
    `[build-event-rosters] wrote ${Object.keys(rosters).length} events → ${outPath}`,
  );
}

// Entry point: runs when executed directly via tsx (mirrors snapshot-content.ts / build-contributions.ts pattern).
// When imported as a module (by snapshot-content.ts), main() is called explicitly by the caller.
const _isMain = process.argv[1]?.endsWith("build-event-rosters.ts") ||
  process.argv[1]?.endsWith("build-event-rosters.js");
if (_isMain) {
  main();
}
