import { parsePersona } from "./persona";
import { parsePersonaSections } from "./persona-sections";
import { ProfileFrontmatterSchema } from "./profile-editor";
import type { MemberWithProfile } from "./content-snapshot";

/**
 * v0.12 Phase 4 — pure card model for /members/[slug]/opengraph-image.
 *
 * H155: the OG route is public and unauthenticated, so the H147
 * `persona_visible` gate and the H146 erasure state (persona === null)
 * are re-applied HERE, in-route, independent of the member page's own
 * gate. Hidden/absent persona ⇒ name-only fallback (bio null, no tags).
 * The card exposes only one_line_bio + expert tag labels — never persona
 * body text.
 */

export interface OgCardModel {
  name: string;
  bio: string | null;
  expertTags: string[];
}

const MAX_EXPERT_TAGS = 5;

export function buildOgCardModel(member: MemberWithProfile): OgCardModel {
  // Same posture as app/members/[slug]/page.tsx: safeParse so a malformed
  // profile never crashes; parse failure ⇒ fm undefined ⇒ visible default.
  const parsedProfile = ProfileFrontmatterSchema.safeParse(
    member.profile?.data ?? {},
  );
  const fm = parsedProfile.success ? parsedProfile.data : undefined;
  const personaVisible = fm?.persona_visible !== false; // H147

  if (!personaVisible || !member.persona) {
    // H147 hidden / H146 erased — name-only card. The hidden persona is
    // never parsed at all (no derived data can leak into the fallback).
    return { name: member.name, bio: null, expertTags: [] };
  }

  const persona = parsePersona(member.persona);
  const sections = parsePersonaSections(persona.body);
  const pooled = [
    ...persona.tags.industries,
    ...persona.tags.functionalRoles,
    ...persona.tags.companyStages,
  ];
  const expertTags = pooled
    .filter((t) => t.depth === "expert")
    .map((t) => t.label)
    .slice(0, MAX_EXPERT_TAGS);

  return { name: member.name, bio: sections.oneLineBio, expertTags };
}
