import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/app/components/Avatar";

/**
 * <ListItem> — Q5.1 / D36 shared list-row primitive.
 *
 * Used by /calendar rows, /home Recent activity, /handbook placeholder
 * sections (Phase A), and /members + /projects + /decisions indexes
 * (Phase B). Avatars rendered via <Avatar> primitive (H59 / H60).
 *
 * Padding `py-3 px-4`; hover `hover:bg-neutral-50`; focus-visible
 * `focus-visible:ring-2 ring-accent-500 ring-offset-2` per Q9.1.
 *
 * No accent on the row itself — accent ONLY appears via the focus ring
 * (Q4.8 — "Accent ONLY means action or you-are-here"; the focus state
 * IS a you-are-here signal).
 */
interface ListItemAvatar {
  name: string;
  handle: string;
  size: 20 | 24 | 32 | 40 | 96;
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
      className="flex items-center gap-3 py-3 px-4 rounded hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
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
        <span className="block text-neutral-900 font-medium truncate">
          {title}
        </span>
        {subtitle && (
          <span className="block text-sm text-neutral-600 truncate">
            {subtitle}
          </span>
        )}
      </span>
      {meta && (
        <span className="text-sm text-neutral-500 shrink-0">{meta}</span>
      )}
      {trailing && <span className="shrink-0">{trailing}</span>}
    </Link>
  );
}
