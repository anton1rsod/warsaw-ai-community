import { writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ThanksRecord {
  recipient: string;
  item_type: "status" | "contribution" | "meeting";
  item_id: string;
  given_at: string;
}

export interface GiverInput {
  slug: string;
  thanks_given: readonly ThanksRecord[];
}

export interface KudosEntry {
  total: number;
  by_type: { status: number; contribution: number; meeting: number };
  recent: ThanksRecord[];
}

export type KudosAggregate = Record<string, KudosEntry>;

const RECENT_CAP = 5;

export function aggregateKudos(
  givers: readonly GiverInput[],
  roster: ReadonlySet<string>,
  botAuthors: ReadonlySet<string>,
): KudosAggregate {
  const out: KudosAggregate = {};
  for (const giver of givers) {
    if (!roster.has(giver.slug)) continue;
    for (const t of giver.thanks_given) {
      if (botAuthors.has(t.recipient)) continue;
      if (!roster.has(t.recipient)) continue;
      const entry = (out[t.recipient] ??= {
        total: 0,
        by_type: { status: 0, contribution: 0, meeting: 0 },
        recent: [],
      });
      entry.total += 1;
      entry.by_type[t.item_type] += 1;
      entry.recent.push(t);
    }
  }
  for (const slug of Object.keys(out)) {
    const entry = out[slug];
    if (!entry) continue;
    entry.recent.sort((a, b) => (a.given_at < b.given_at ? 1 : a.given_at > b.given_at ? -1 : 0));
    entry.recent = entry.recent.slice(0, RECENT_CAP);
  }
  return out;
}

const BOT_AUTHORS = new Set(["warsaw-ai-bot", "warsaw-ai-bot[bot]", "github-actions[bot]"]);

function readGivers(membersDir: string): GiverInput[] {
  if (!existsSync(membersDir)) return [];
  const out: GiverInput[] = [];
  for (const f of readdirSync(membersDir, { withFileTypes: true })) {
    if (!f.isFile() || !f.name.endsWith(".md")) continue;
    if (f.name === "roster.md" || f.name === "git-email-aliases.md") continue;
    try {
      const { data } = matter(readFileSync(path.join(membersDir, f.name), "utf-8"));
      out.push({
        slug: f.name.replace(/\.md$/, ""),
        thanks_given: (data.thanks_given ?? []) as ThanksRecord[],
      });
    } catch (err) {
      console.warn(`[build-kudos] skip ${f.name}:`, err instanceof Error ? err.message : err);
    }
  }
  return out;
}

function readRosterSlugs(membersDir: string): Set<string> {
  const out = new Set<string>();
  if (!existsSync(membersDir)) return out;
  for (const f of readdirSync(membersDir, { withFileTypes: true })) {
    if (!f.isFile() || !f.name.endsWith(".md")) continue;
    if (f.name === "roster.md" || f.name === "git-email-aliases.md") continue;
    out.add(f.name.replace(/\.md$/, ""));
  }
  return out;
}

export function main(): void {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const membersDir = path.join(repoRoot, "community", "members");
  const outPath = path.resolve(__dirname, "..", "lib", "__generated__", "kudos.json");
  const roster = readRosterSlugs(membersDir);
  const givers = readGivers(membersDir);
  const agg = aggregateKudos(givers, roster, BOT_AUTHORS);
  writeFileSync(outPath, JSON.stringify(agg, null, 2) + "\n", "utf-8");
  console.log(`[build-kudos-aggregate] wrote ${Object.keys(agg).length} recipients → ${outPath}`);
}

if (process.argv[1]?.endsWith("build-kudos-aggregate.ts")) {
  main();
}
