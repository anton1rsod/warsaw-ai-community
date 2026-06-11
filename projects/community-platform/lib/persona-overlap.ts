import type { Depth, ParsedPersona, PersonaTag } from "./persona";
import { s } from "./i18n/strings";

/**
 * v0.12 overlap lens (design doc §4.2, O1 lock).
 *
 * H160: the result is computed per-request for the signed-in viewer and
 * returned to the renderer ONLY — never persisted, never logged. Do not add
 * log lines or storage here.
 */

export interface OverlapTag {
  label: string;
  viewerDepth: Depth | null;
  subjectDepth: Depth | null;
}

export interface OverlapResult {
  shared: OverlapTag[];
  complementary: OverlapTag[];
  starters: string[];
}

const DEPTH_RANK: Readonly<Record<Depth, number>> = {
  expert: 3,
  practitioner: 2,
  familiar: 1,
};

function rank(depth: Depth | null): number {
  return depth === null ? 0 : DEPTH_RANK[depth];
}

/**
 * Pool industries + functionalRoles + companyStages into one
 * case-insensitive, trimmed label map. When the same label appears in more
 * than one list, the DEEPEST depth wins (deterministic).
 */
function poolTags(p: ParsedPersona): Map<string, PersonaTag> {
  const pool = new Map<string, PersonaTag>();
  const lists = [
    p.tags.industries,
    p.tags.functionalRoles,
    p.tags.companyStages,
  ];
  for (const list of lists) {
    for (const tag of list) {
      const label = tag.label.trim();
      const key = label.toLowerCase();
      if (key === "") continue;
      const existing = pool.get(key);
      if (!existing || rank(tag.depth) > rank(existing.depth)) {
        pool.set(key, { label, depth: tag.depth });
      }
    }
  }
  return pool;
}

/** Combined depth rank desc; alphabetical label tiebreak for determinism. */
function byCombinedRankDesc(a: OverlapTag, b: OverlapTag): number {
  const diff =
    rank(b.viewerDepth) +
    rank(b.subjectDepth) -
    (rank(a.viewerDepth) + rank(a.subjectDepth));
  return diff !== 0 ? diff : a.label.localeCompare(b.label);
}

export function computeOverlap(
  viewer: ParsedPersona,
  subject: ParsedPersona,
): OverlapResult {
  const viewerPool = poolTags(viewer);
  const subjectPool = poolTags(subject);

  const shared: OverlapTag[] = [];
  const complementary: OverlapTag[] = [];

  for (const [key, subjectTag] of subjectPool) {
    const viewerTag = viewerPool.get(key);
    if (!viewerTag) continue;
    const tag: OverlapTag = {
      label: subjectTag.label,
      viewerDepth: viewerTag.depth,
      subjectDepth: subjectTag.depth,
    };
    shared.push(tag);
    // Complementary = subject is expert where the viewer holds the label
    // at a lower rank (incl. depth-less, rank 0).
    if (subjectTag.depth === "expert" && rank(viewerTag.depth) < 3) {
      complementary.push(tag);
    }
  }

  const sortedShared = [...shared].sort(byCombinedRankDesc);
  const sortedComplementary = [...complementary].sort(byCombinedRankDesc);

  // O1 lock: max 3 deterministic template starters; each is skipped when its
  // source list is empty → starters.length is 0-3.
  const starters: string[] = [];
  const topShared = sortedShared[0];
  if (topShared) {
    starters.push(s("lens.starterShared").replace("{label}", topShared.label));
  }
  const topComplementary = sortedComplementary[0];
  if (topComplementary) {
    starters.push(
      s("lens.starterComplementary").replace("{label}", topComplementary.label),
    );
  }
  const topNiche = subject.tags.niche[0];
  if (topNiche !== undefined && topNiche.trim() !== "") {
    starters.push(s("lens.starterNiche").replace("{item}", topNiche.trim()));
  }

  return { shared: sortedShared, complementary: sortedComplementary, starters };
}

/**
 * Phase 3 render gate: the lens band renders only when the overlap carries
 * at least one visible row. Lives next to computeOverlap so the "has
 * content" definition cannot drift from the OverlapResult shape.
 */
export function overlapHasContent(overlap: OverlapResult): boolean {
  return (
    overlap.shared.length > 0 ||
    overlap.complementary.length > 0 ||
    overlap.starters.length > 0
  );
}
