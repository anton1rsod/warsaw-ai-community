import type { RosterMember } from "@/lib/roster";
import type { Meeting } from "@/lib/meetings";

export interface GitCommit {
  sha: string;
  author: string;
  date: string;
  files: readonly string[];
}

export interface Contributions {
  projectCommits: number;
  adrsFiled: number;
  meetingsAttended: number;
  statusPosts: number;
}

const BOT_AUTHORS = new Set<string>([
  "warsaw-ai-bot",
  "warsaw-ai-bot[bot]",
]);

const ADR_RE = /^docs\/decisions\/\d{4}-.+\.md$/;
const STATUS_RE = /^community\/status\/\d{4}-W\d{2}\/.+\.md$/;

export interface ComputeContributionsInput {
  commits: readonly GitCommit[];
  meetings: readonly Pick<Meeting, "slug" | "attendees">[];
  roster: readonly RosterMember[];
}

function emptyCounts(): Contributions {
  return {
    projectCommits: 0,
    adrsFiled: 0,
    meetingsAttended: 0,
    statusPosts: 0,
  };
}

export function computeContributions(
  input: ComputeContributionsInput,
): Record<string, Contributions> {
  const result: Record<string, Contributions> = {};
  for (const m of input.roster) {
    result[m.githubHandle] = emptyCounts();
  }

  for (const commit of input.commits) {
    const author = commit.author.toLowerCase();
    if (BOT_AUTHORS.has(author)) continue;
    const counts = result[author];
    if (!counts) continue;

    if (commit.files.some((f) => f.startsWith("projects/"))) {
      counts.projectCommits += 1;
    }
    counts.adrsFiled += commit.files.filter((f) => ADR_RE.test(f)).length;
    counts.statusPosts += commit.files.filter((f) => STATUS_RE.test(f)).length;
  }

  for (const meeting of input.meetings) {
    for (const attendeeName of meeting.attendees) {
      const member = input.roster.find((m) => m.name === attendeeName);
      if (member) {
        const counts = result[member.githubHandle];
        if (counts) counts.meetingsAttended += 1;
      }
    }
  }

  return result;
}

export interface ProjectContribution {
  handle: string;
  commits: number;
}

export type ProjectContributions = Record<string, readonly ProjectContribution[]>;

export const TOP_CONTRIBUTORS_LIMIT = 5 as const;

export interface ComputeProjectContributionsInput {
  commits: readonly GitCommit[];
  roster: readonly RosterMember[];
}

export function computeProjectContributions(
  input: ComputeProjectContributionsInput,
): ProjectContributions {
  const rosterSet = new Set(input.roster.map((m) => m.githubHandle));
  const buckets = new Map<string, Map<string, number>>();

  for (const commit of input.commits) {
    const author = commit.author.toLowerCase();
    if (BOT_AUTHORS.has(author)) continue; // H26
    if (!rosterSet.has(author)) continue; // Correction D: use lowercased author

    const slugs = new Set<string>();
    for (const file of commit.files) {
      if (!file.startsWith("projects/")) continue;
      const parts = file.split("/");
      const slug = parts[1];
      if (slug) slugs.add(slug);
    }

    for (const slug of slugs) {
      let projectBucket = buckets.get(slug);
      if (!projectBucket) {
        projectBucket = new Map<string, number>();
        buckets.set(slug, projectBucket);
      }
      projectBucket.set(
        author, // Correction D: use lowercased author
        (projectBucket.get(author) ?? 0) + 1,
      );
    }
  }

  const result: Record<string, readonly ProjectContribution[]> = {};
  for (const [slug, bucket] of buckets) {
    const sorted = Array.from(bucket.entries())
      .map(([handle, commits]) => ({ handle, commits }))
      .sort((a, b) => b.commits - a.commits)
      .slice(0, TOP_CONTRIBUTORS_LIMIT);
    result[slug] = sorted;
  }
  return result;
}
