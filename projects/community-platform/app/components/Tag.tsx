/**
 * <Tag> — stage / status / type chip per Q5.5 + O12 color map.
 *
 * O12 lock (chat-23 spec §14.4): NEUTRAL by default; the single per-value
 * accent tint is `status:proposed` (signals "open question — needs
 * attention," which IS action-adjacent under Q4.8 — "Accent ONLY means
 * action or you-are-here").
 *
 * Every other chip is neutral. Restraint is the brand.
 */
type TagVariant = "stage" | "status" | "type";

interface TagProps {
  label: string;
  variant?: TagVariant;
  value?: string;
}

function classesFor(variant: TagVariant | undefined, value: string | undefined): string {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium";

  if (variant === "stage") {
    if (value === "complete" || value === "paused") {
      return `${base} bg-neutral-100 text-neutral-500`;
    }
    return `${base} bg-neutral-100 text-neutral-700`;
  }

  if (variant === "status") {
    if (value === "proposed") {
      // O12 — the single accent-tinted variant. Q4.8 action-adjacent slot.
      return `${base} bg-accent-50 text-accent-700`;
    }
    if (value === "superseded") {
      return `${base} bg-neutral-100 text-neutral-400 line-through`;
    }
    return `${base} bg-neutral-100 text-neutral-700`;
  }

  if (variant === "type") {
    return `${base} bg-neutral-100 text-neutral-700`;
  }

  // No variant — generic neutral chip
  return `${base} bg-neutral-100 text-neutral-700`;
}

export function Tag({ label, variant, value }: TagProps): React.JSX.Element {
  return <span className={classesFor(variant, value)}>{label}</span>;
}
