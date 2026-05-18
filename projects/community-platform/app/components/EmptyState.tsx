import Link from "next/link";
import type { Route } from "next";

/**
 * <EmptyState> — Q3.5 codification + walkthrough §3 (asymmetric empty-state fix).
 *
 * Renders at least the headline. Every Phase A surface that mounts this
 * component MUST pass at least one of calibration / nextAction (per
 * spec §14.5). The component itself permits headline-only renders so a
 * future v0.5+ "terminal empty state" use case (e.g., /no-access) does
 * not require a new component; Phase A code-review enforces the
 * "calibration OR nextAction required on real surfaces" invariant.
 *
 * external nextAction: opens in new tab; appends ↗ glyph; rel=noopener.
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
      <p className="text-neutral-900 font-medium">{headline}</p>
      {calibration && (
        <p className="mt-2 text-sm text-neutral-600">{calibration}</p>
      )}
      {nextAction && (
        <p className="mt-3">
          {nextAction.external ? (
            <a
              href={nextAction.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-700 underline"
            >
              {nextAction.label} ↗
            </a>
          ) : (
            <Link
              href={nextAction.href as Route}
              className="text-accent-700 underline"
            >
              {nextAction.label}
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
