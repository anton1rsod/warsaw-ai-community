/**
 * <Tag> — stage / status / type chip per Q5.5 + O12 color map.
 *
 * O12 lock (chat-23 spec §14.4): NEUTRAL by default; the single per-value
 * accent tint is `status:proposed` (signals "open question — needs
 * attention," which IS action-adjacent under Q4.8 — "Accent ONLY means
 * action or you-are-here").
 *
 * Every other chip is neutral. Restraint is the brand.
 *
 * v0.9 warm reskin (H100): migrated from scaffolding neutrals to warm tokens.
 * `bg-cream-deep` replaces old bg; `text-dust` replaces de-emphasis;
 * `text-ink` replaces old text-dark; border-radius removed per D6.
 */
type TagVariant = "stage" | "status" | "type";

interface TagProps {
  label: string;
  variant?: TagVariant;
  value?: string;
}

function classesFor(variant: TagVariant | undefined, value: string | undefined): string {
  const base = "inline-flex items-center px-2 py-0.5 font-voice text-[10px] uppercase tracking-[0.5px]";

  if (variant === "stage") {
    if (value === "complete" || value === "paused") {
      return `${base} bg-cream-deep text-dust`;
    }
    return `${base} bg-cream-deep text-ink`;
  }

  if (variant === "status") {
    if (value === "proposed") {
      // O12 — the single accent-tinted variant. Q4.8 action-adjacent slot.
      return `${base} bg-accent-50 text-accent-700`;
    }
    if (value === "superseded") {
      return `${base} bg-cream-deep text-dust line-through`;
    }
    return `${base} bg-cream-deep text-ink`;
  }

  if (variant === "type") {
    return `${base} bg-cream-deep text-ink`;
  }

  // No variant — generic warm chip
  return `${base} bg-cream-deep text-ink`;
}

export function Tag({ label, variant, value }: TagProps): React.JSX.Element {
  return <span className={classesFor(variant, value)}>{label}</span>;
}
