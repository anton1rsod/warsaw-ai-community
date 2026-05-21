import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar, type AvatarSize } from "@/app/components/Avatar";

/**
 * <ListItem> — Q5.1 / D36 shared list-row primitive.
 *
 * v0.6 Phase 3.8 restyle (spec §16.5):
 *   - Outer wrapper: paper background + 3px ink left border (no radii).
 *   - Title rendered in Fraunces italic (font-display) for serif voice.
 *   - Subtitle/meta rendered in JetBrains Mono (font-voice) dust color.
 *   - 0-radii — preserves v0.6 "no rounded corners" posture.
 *   - Compact spacing matches the ship-card pattern from HomeFeed (§16.5):
 *     `px-3 py-2` with `text-[11px]` body size.
 *   - Avatar (when present) renders the amber monogram tile from Phase 3.7
 *     (Avatar.tsx — bg-accent-500 + ink text).
 *
 * Used by /calendar rows, /home Recent activity, /handbook placeholder
 * sections (Phase A), and /members + /projects + /decisions indexes
 * (Phase B). Avatars rendered via <Avatar> primitive (H59 / H60).
 *
 * Focus-visible per Q9.1 + spec §16.6 motion: ring-2 accent-500
 * offset-2. Accent appears ONLY via the focus ring (Q4.8 — "Accent ONLY
 * means action or you-are-here"; focus IS a you-are-here signal). The
 * static left-border uses ink rather than accent to avoid diluting
 * accent semantics for non-emphasis rows.
 */
interface ListItemAvatar {
  name: string;
  handle: string;
  size: AvatarSize;
  photoOptOut?: boolean;
}

interface ListItemProps {
  href: string;
  title: string;
  subtitle?: string;
  meta?: string;
  avatar?: ListItemAvatar;
  trailing?: ReactNode;
}

export function ListItem({
  href,
  title,
  subtitle,
  meta,
  avatar,
  trailing,
}: ListItemProps): React.JSX.Element {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 py-3 px-4 bg-paper border-l-[3px] border-l-ink no-underline text-ink hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
    >
      {avatar && (
        <Avatar
          name={avatar.name}
          handle={avatar.handle}
          size={avatar.size}
          photoOptOut={avatar.photoOptOut}
        />
      )}
      <span className="flex-1 min-w-0">
        <span className="block font-display italic text-ink text-[13px] truncate">
          {title}
        </span>
        {subtitle && (
          <span className="block font-voice text-[10px] text-dust truncate">
            {subtitle}
          </span>
        )}
      </span>
      {meta && (
        <span className="font-voice text-[10px] text-dust shrink-0">
          {meta}
        </span>
      )}
      {trailing && <span className="shrink-0">{trailing}</span>}
    </Link>
  );
}
