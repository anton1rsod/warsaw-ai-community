import type { RosterMember, MemberProfile } from "@/lib/roster";
import type { ProjectDetail } from "@/lib/projects";
import type { Decision } from "@/lib/decisions";
import type { Meeting } from "@/lib/meetings";
import type { Contributions, ProjectContribution } from "@/lib/contributions";
import snapshotJson from "@/lib/__generated__/content-snapshot.json";
import contributionsJson from "@/lib/__generated__/contributions.json";
import projectContributionsJson from "@/lib/__generated__/project-contributions.json";

export interface MemberWithProfile extends RosterMember {
  profile: MemberProfile | null;
  persona: string | null;
}

export interface ContentSnapshot {
  generatedAt: string;
  members: readonly MemberWithProfile[];
  governance: {
    admins: readonly string[];
    communityManagers: readonly string[];
  };
  projects: readonly ProjectDetail[];
  decisions: readonly Decision[];
  meetings: readonly Meeting[];
}

export const snapshot: ContentSnapshot = snapshotJson as ContentSnapshot;

function normalize(handle: string): string {
  return handle.replace(/^@/, "").toLowerCase().trim();
}

// Set-backed for O(1) lookups (auth path; called per protected request).
const adminSet = new Set<string>(snapshot.governance.admins.map(normalize));
const cmSet = new Set<string>(
  snapshot.governance.communityManagers.map(normalize),
);

export function isAdmin(handle: string): boolean {
  if (!handle) return false;
  return adminSet.has(normalize(handle));
}

export function isCommunityManager(handle: string): boolean {
  if (!handle) return false;
  return cmSet.has(normalize(handle));
}

export function findMemberByHandle(
  handle: string,
): MemberWithProfile | undefined {
  if (!handle) return undefined;
  const normalized = normalize(handle);
  return snapshot.members.find((m) => m.githubHandle === normalized);
}

export function findMemberBySlug(slug: string): MemberWithProfile | undefined {
  return snapshot.members.find((m) => m.slug === slug);
}

export function listMembers(): readonly MemberWithProfile[] {
  return snapshot.members;
}

export function listProjectDetails(): readonly ProjectDetail[] {
  return snapshot.projects;
}

export function findProjectBySlug(slug: string): ProjectDetail | undefined {
  return snapshot.projects.find((p) => p.slug === slug);
}

export function listDecisionsFromSnapshot(): readonly Decision[] {
  return snapshot.decisions;
}

export function findDecisionBySlug(slug: string): Decision | undefined {
  return snapshot.decisions.find((d) => d.slug === slug);
}

export function listMeetingsFromSnapshot(): readonly Meeting[] {
  return snapshot.meetings;
}

export function findMeetingBySlug(slug: string): Meeting | undefined {
  return snapshot.meetings.find((m) => m.slug === slug);
}

const contributionsByHandle: Record<string, Contributions> =
  contributionsJson as Record<string, Contributions>;

const ZERO_CONTRIBUTIONS: Contributions = {
  projectCommits: 0,
  adrsFiled: 0,
  meetingsAttended: 0,
  statusPosts: 0,
};

export function getContributions(handle: string): Contributions {
  if (!handle) return ZERO_CONTRIBUTIONS;
  return contributionsByHandle[normalize(handle)] ?? ZERO_CONTRIBUTIONS;
}

const projectContributions: Record<string, readonly ProjectContribution[]> =
  projectContributionsJson as Record<string, readonly ProjectContribution[]>;

export function getProjectContributions(
  projectSlug: string,
): readonly ProjectContribution[] {
  return projectContributions[projectSlug] ?? [];
}
