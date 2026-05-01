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

// `as ContentSnapshot` widens the JSON literal types (e.g. an empty
// communityManagers array would otherwise be inferred as `never[]`,
// breaking forward-compatible consumers). If the snapshot script's output
// drifts from this interface, downstream consumers will type-error at the
// boundary instead of here, but the snapshot generator itself is typed via
// readRoster + readGovernance, so shape drift surfaces in scripts/.
export const snapshot: ContentSnapshot = snapshotJson as ContentSnapshot;

// Build Set-backed predicates at module init so isAdmin / isCommunityManager
// match lib/governance.ts's O(1) lookup contract. JSON deserializes
// readonly string[] arrays which would otherwise force Array.includes (O(n)).
const adminSet = new Set<string>(snapshot.governance.admins);
const cmSet = new Set<string>(snapshot.governance.communityManagers);

function normalize(handle: string): string {
  return handle.replace(/^@/, "").toLowerCase().trim();
}

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
): RosterMember | undefined {
  if (!handle) return undefined;
  const normalized = normalize(handle);
  return snapshot.roster.find((m) => m.githubHandle === normalized);
}
