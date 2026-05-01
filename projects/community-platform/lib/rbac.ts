import type { RosterMember } from "@/lib/roster";
import type { GovernanceSnapshot } from "@/lib/governance";

export type Role = "admin" | "community_manager" | "member" | "guest";

export interface RbacContext {
  readonly roster: readonly RosterMember[];
  readonly governance: GovernanceSnapshot;
}

/**
 * Normalize a raw GitHub handle: strip leading `@`, lowercase, trim.
 * Returns empty string for blank input.
 */
function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@/, "").toLowerCase().trim();
}

/**
 * Resolve a GitHub handle to one of four roles per spec §0.1 four-role model.
 *
 * Resolution order:
 * 1. Normalize input — empty after normalization → "guest".
 * 2. Handle must appear in roster — if not → "guest" (must-be-on-roster invariant).
 * 3. Admin check (governance.isAdmin) — if true → "admin".
 * 4. Community manager check — if true → "community_manager".
 * 5. Else → "member".
 *
 * Admin trumps community_manager when both flags are set.
 */
export function resolveRole(handle: string, ctx: RbacContext): Role {
  const normalized = normalizeHandle(handle);

  if (!normalized) return "guest";

  const onRoster = ctx.roster.some((m) => m.githubHandle === normalized);
  if (!onRoster) return "guest";

  if (ctx.governance.isAdmin(normalized)) return "admin";
  if (ctx.governance.isCommunityManager(normalized)) return "community_manager";

  return "member";
}

/**
 * Returns true for privileged roles (admin, community_manager).
 */
export function isPrivileged(role: Role): boolean {
  return role === "admin" || role === "community_manager";
}
