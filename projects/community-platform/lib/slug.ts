// projects/community-platform/lib/slug.ts

/**
 * Slugify a display name: NFKD-normalize, strip combining diacritics,
 * lowercase, collapse non-alphanumerics to hyphens, trim hyphens.
 *
 * Logic identical to v0.1's previously-private helper in lib/roster.ts;
 * promoted to public so the v0.1.1 invitation orchestrator + roster
 * parser share a single implementation (DRY).
 */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Slugs that collide with non-member files in `community/members/`.
 * Generators MUST never emit these; the collision helper bumps the
 * suffix when input slugifies to a reserved value.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "roster",
  "git-email-aliases",
  "invitations",
]);

const MAX_COLLISION_SUFFIX = 9;

/**
 * Return the first non-colliding slug, starting from `base`.
 *
 * Policy (spec §11.4):
 * 1. If `base ∈ RESERVED_SLUGS` → start search at `<base>-2`.
 * 2. Otherwise → check `<base>` first.
 * 3. On collision, increment numeric suffix (`-2`, `-3`, ...).
 * 4. Hard cap at `-9`; throw if exhausted.
 */
export async function nextAvailableSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const startReserved = RESERVED_SLUGS.has(base);
  let candidate = startReserved ? `${base}-2` : base;
  let suffix = startReserved ? 2 : 1;

  for (;;) {
    const taken = await exists(candidate);
    if (!taken) return candidate;
    suffix += 1;
    if (suffix > MAX_COLLISION_SUFFIX) {
      throw new Error(
        `slug collision cap exceeded for base "${base}" — last tried "${candidate}"`,
      );
    }
    candidate = `${base}-${suffix}`;
  }
}
