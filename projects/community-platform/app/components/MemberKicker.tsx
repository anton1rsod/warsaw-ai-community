/**
 * v0.12 H157 — the section kicker IS the heading: one <h2> doing visual +
 * semantic duty. Never aria-hidden, never a parallel sr-only twin (drift
 * trap) — kickers are the page's only section labels below the h1, so hiding
 * them would leave no heading structure (SC 1.3.1). The decorative "// "
 * prefix wraps in an aria-hidden span; uppercase comes from CSS
 * text-transform over sentence-case source text (AT reads the sentence-case
 * string). At ≥1080px the kicker absolutely positions into the left margin
 * as a right-aligned catalog label — AT-safe because DOM order is unchanged
 * (spec §3). Callers pass `id` when a region needs aria-labelledby (Phase 3
 * lens band).
 */
interface MemberKickerProps {
  label: string;
  id?: string;
}

export function MemberKicker({ label, id }: MemberKickerProps): React.JSX.Element {
  return (
    <h2
      id={id}
      className="kicker relative font-voice text-[11px] font-medium uppercase tracking-[0.09em] text-dust min-[1080px]:absolute min-[1080px]:-left-[164px] min-[1080px]:top-[3px] min-[1080px]:w-[140px] min-[1080px]:text-right"
    >
      <span aria-hidden="true">{"// "}</span>
      {label}
    </h2>
  );
}
