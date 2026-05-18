import Image from "next/image";
import { strings } from "@/lib/i18n/strings";

/**
 * Canonical avatar sizes per spec §14.4 (Q5.2):
 *   20 — /home This-Week strip
 *   24 — Recent activity
 *   32 — /calendar items + <Header> dropdown trigger
 *   40 — /events/[slug] RSVP roster strip + /meetings/[slug] attendee list
 *   96 — /members/[slug] profile header (Phase B)
 *
 * H59 SSRF gate: next.config.ts images.remotePatterns whitelists
 * avatars.githubusercontent.com ONLY (Phase A.0.4). This component
 * composes URLs only against that host.
 *
 * H60 opt-out: photoOptOut=true (from member frontmatter `photo: false`)
 * suppresses the GitHub URL fetch and renders initials. Member's GitHub
 * avatar URL is NEVER passed to next/image when opting out.
 *
 * O6 initials algorithm: single character — the first letter of the
 * GitHub handle (uppercased). Aesthetics handled via the amber border
 * on hover (Q4.8 — current-page nav state semantic adapted).
 */
type AvatarSize = 20 | 24 | 32 | 40 | 96;

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
  photoOptOut = false,
  decorative = false,
}: AvatarProps): React.JSX.Element {
  const shouldShowInitials = photoOptOut || !handle;
  if (shouldShowInitials) {
    return (
      <span
        aria-hidden={decorative ? "true" : undefined}
        aria-label={
          decorative ? undefined : `${name}${strings["avatar.altSuffix"]}`
        }
        className="inline-flex items-center justify-center rounded-full bg-neutral-200 text-neutral-700 font-medium"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      >
        {initialsFor(handle, name)}
      </span>
    );
  }

  const url = `https://avatars.githubusercontent.com/${handle}?size=${size * 2}`;
  return (
    <Image
      src={url}
      alt={decorative ? "" : `${name}${strings["avatar.altSuffix"]}`}
      width={size}
      height={size}
      className="inline-block rounded-full"
    />
  );
}
