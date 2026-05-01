import type { RosterMember, MemberProfile } from "@/lib/roster";
import type { ProjectDetail } from "@/lib/projects";
import type { Decision } from "@/lib/decisions";
import type { Meeting } from "@/lib/meetings";
import snapshotJson from "@/lib/__generated__/content-snapshot.json";

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

export function isAdmin(handle: string): boolean {
  if (!handle) return false;
  return snapshot.governance.admins.includes(normalize(handle));
}

export function isCommunityManager(handle: string): boolean {
  if (!handle) return false;
  return snapshot.governance.communityManagers.includes(normalize(handle));
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
