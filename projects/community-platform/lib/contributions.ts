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
