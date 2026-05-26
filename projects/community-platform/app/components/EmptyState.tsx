import { Pill } from "@/app/components/Pill";

/**
 * <EmptyState> — Q3.5 codification + walkthrough §3 (asymmetric empty-state fix).
 *
 * v0.8 restyle (brand §2):
 *     in JetBrains Mono (font-voice) dust — quiet "system voice" empty state.
 *   - Calibration rendered in the same family at smaller size.
 *   - nextAction CTA rendered as <Pill variant="dashed"> per Phase 3.8
 *     brief: this matches the dashed-border CTA pattern used across
 *     other v0.6 surfaces (e.g., /events). External nextAction keeps
 *     the ↗ glyph + rel=noopener (preserves Q3.5 external semantics —
 *     Pill anchor mode adds target=_blank + rel=noopener when external).
 *
 * Renders at least the headline. Every Phase A surface that mounts this
 * component MUST pass at least one of calibration / nextAction (per
 * spec §14.5). The component itself permits headline-only renders so a
 * future v0.5+ "terminal empty state" use case (e.g., /no-access) does
 * not require a new component; Phase A code-review enforces the
 * "calibration OR nextAction required on real surfaces" invariant.
 */
interface EmptyStateProps {
  headline: string;
  calibration?: string;
  nextAction?: {
    label: string;
    href: string;
    external?: boolean;
  };
}

export function EmptyState({
  headline,
  calibration,
  nextAction,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className="py-8 px-4 text-center">
      <p className="font-voice text-dust text-[12px]">{headline}</p>
      {calibration && (
        <p className="mt-2 font-voice text-dust text-[11px]">
          {calibration}
        </p>
      )}
      {nextAction && (
        <p className="mt-3">
          <Pill
            variant="dashed"
            href={nextAction.href}
            external={nextAction.external}
          >
            {nextAction.external ? `${nextAction.label} ↗` : nextAction.label}
          </Pill>
        </p>
      )}
    </div>
  );
}
