import { s } from "@/lib/i18n/strings";

/**
 * v0.6 Phase 3.7 — Avatar restyle (amber monogram tile).
 *
 * Canonical avatar sizes per spec §14.4 (Q5.2):
 *   20 — /home This-Week strip
 *   24 — Recent activity
 *   32 — /calendar items + <Header> dropdown trigger
 *   40 — /events/[slug] RSVP roster strip + /meetings/[slug] attendee list
 *   96 — /members/[slug] profile header (Phase B)
 *
 * v0.6 visual (§16.4): amber-bg (`bg-accent-500`) + ink text + 0-radii
 * monogram tile. Matches the 18×18 Header avatar chip pattern. No photos
 * are rendered for any prop combination — photos are out of scope for
 * v0.6 (§16.5 "Amber-bg monogram tile").
 *
 * H59 SSRF gate: no longer relevant for v0.6 since no remote URL is
 * composed at all. (Whitelist in next.config.ts is preserved but unused
 * by this component.)
 *
 * H60 opt-out: trivially satisfied — initials-only visual means no
 * GitHub avatar URL is fetched for any caller. The `photoOptOut` prop
 * is preserved in the public API for backward-compat with v0.4/v0.5
 * callers, but is functionally a no-op in v0.6 since both branches
 * render the same monogram tile.
 *
 * O6 initials algorithm preserved: single character — the first letter
 * of the handle (uppercased), falling back to the first letter of name
 * when handle is empty. Spec §16.4 ASCII shows `[AS]` decoratively but
 * the locked O6 contract is single-char per existing tests.
 */
export type AvatarSize = 20 | 24 | 32 | 40 | 96;

interface AvatarProps {
  name: string;
  handle: string;
  size: AvatarSize;
  photoOptOut?: boolean;
  decorative?: boolean;
}

function initialsFor(handle: string, name: string): string {
  const source = handle || name;
  return source.charAt(0).toUpperCase();
}

export function Avatar({
  name,
  handle,
  size,
  photoOptOut: _photoOptOut = false,
  decorative = false,
}: AvatarProps): React.JSX.Element {
  // v0.6: always render the amber monogram tile. `photoOptOut` is preserved
  // in the public API (backward-compat with v0.4/v0.5 callers) but ignored —
  // there is no photo branch anymore (§16.4 / §16.5). H60 is satisfied
  // trivially: no GitHub avatar URL is composed for any prop combination.
  void _photoOptOut;
  return (
    <span
      aria-hidden={decorative ? "true" : undefined}
      aria-label={
        decorative ? undefined : `${name}${s("avatar.altSuffix")}`
      }
      className="inline-flex items-center justify-center bg-accent-500 text-ink font-voice font-bold"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initialsFor(handle, name)}
    </span>
  );
}
