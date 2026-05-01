import type { RosterMember } from "@/lib/roster";
import type { StatusUpdate } from "@/lib/status-reader";

export interface HealthMetric {
  activePosters: number;
  totalMembers: number;
  ratio: number;
}

export interface ComputeHealthMetricInput {
  roster: readonly RosterMember[];
  weekStatuses: readonly Pick<StatusUpdate, "slug">[];
}

/**
 * Spec §2 goal 8 / §10: weekly active posters / total roster members.
 * Each member is counted at most once per week (slug-deduped); statuses
 * whose slug is not on the roster are ignored. Ratio is 0 when the
 * roster is empty (no division-by-zero).
 */
export function computeHealthMetric(
  input: ComputeHealthMetricInput,
): HealthMetric {
  const totalMembers = input.roster.length;
  const memberSlugs = new Set<string>(input.roster.map((m) => m.slug));
  const activeSlugs = new Set<string>();
  for (const s of input.weekStatuses) {
    if (memberSlugs.has(s.slug)) activeSlugs.add(s.slug);
  }
  const activePosters = activeSlugs.size;
  return {
    activePosters,
    totalMembers,
    ratio: totalMembers === 0 ? 0 : activePosters / totalMembers,
  };
}
