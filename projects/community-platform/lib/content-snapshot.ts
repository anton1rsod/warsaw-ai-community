import type { RosterMember } from "@/lib/roster";
import snapshotJson from "@/lib/__generated__/content-snapshot.json";

export interface ContentSnapshot {
  generatedAt: string;
  roster: readonly RosterMember[];
  governance: {
    admins: readonly string[];
    communityManagers: readonly string[];
  };
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
): RosterMember | undefined {
  if (!handle) return undefined;
  const normalized = normalize(handle);
  return snapshot.roster.find((m) => m.githubHandle === normalized);
}
