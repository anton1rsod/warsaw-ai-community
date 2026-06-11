import { s } from "@/lib/i18n/strings";
import type { OverlapResult } from "@/lib/persona-overlap";

/**
 * v0.12 Phase 3 — overlap lens band (spec §4.2, design doc §3).
 *
 * H160: the OverlapResult is per-request, viewer-private computation — this
 * component must never log, persist, or emit it (no analytics, no console).
 *
 * H156 (pair contrast): this is the page's only --surface-soft panel, where
 * dust (4.42:1) and accent-700 (4.49:1) are sub-AA. Every text tone in here
 * is ink / ink-body / ink-muted; the starters disclosure renders ink with an
 * amber (accent-500) underline per design doc §3.
 *
 * H157: the kicker is a real <h2> (the band's section label). The visual
 * "you × {name}" is aria-hidden with an sr-only alternative so AT never
 * announces "multiplication sign"; the section is aria-labelledby it.
 *
 * H158: starters use native details/summary (works without JS). No headings
 * inside the summary element; caret aria-hidden; native marker suppressed both
 * ways (list-none + the Tailwind arbitrary variant for ::-webkit-details-marker).
 *
 * H159 (SC 2.5.8): the summary element carries a ≥24px hit box via
 * min-height + padding-block; visual size unchanged.
 *
 * mt-14 = the page's 56px section rhythm; it lives here (not on a page
 * wrapper) so a null render leaves no orphan margin.
 */
export function OverlapLens({
  overlap,
  subjectName,
}: {
  overlap: OverlapResult;
  subjectName: string;
}): React.JSX.Element | null {
  const { shared, complementary, starters } = overlap;
  if (shared.length === 0 && complementary.length === 0 && starters.length === 0) {
    return null;
  }

  const [sharedPre = "", sharedPost = ""] = s("lens.sharedFmt").split("{labels}");
  const firstComplementary = complementary[0];

  return (
    <section
      aria-labelledby="overlap-lens-kicker"
      className="mt-14 rounded-[10px] bg-surface-soft px-5 py-4"
    >
      <h2
        id="overlap-lens-kicker"
        className="font-voice text-[11px] font-medium uppercase tracking-[0.09em] text-ink-muted"
      >
        <span aria-hidden="true">{"// "}</span>
        <span aria-hidden="true">{s("lens.kicker").replace("{name}", subjectName)}</span>
        <span className="sr-only">{s("lens.kickerSr").replace("{name}", subjectName)}</span>
      </h2>

      {shared.length > 0 ? (
        <p className="mt-3 font-body text-[15px] leading-relaxed text-ink-body">
          {sharedPre}
          {shared.map((tag, i) => (
            <span key={tag.label}>
              {i > 0 ? ", " : null}
              <span className="font-medium text-ink">{tag.label}</span>
            </span>
          ))}
          {sharedPost}
        </p>
      ) : null}

      {firstComplementary ? (
        <p className="mt-1 font-body text-[15px] leading-relaxed text-ink-muted">
          {s("lens.complementaryFmt")
            .replace("{label}", firstComplementary.label)
            // Viewer holds the label with no declared depth (rank 0) — read
            // it as the lowest spoken rung. Pinned by unit test.
            .replace("{depth}", firstComplementary.viewerDepth ?? "familiar")}
        </p>
      ) : null}

      {starters.length > 0 ? (
        <details className="mt-3">
          <summary className="inline-flex min-h-[24px] cursor-pointer list-none items-center gap-1.5 py-0.5 font-voice text-[12px] text-ink underline decoration-accent-500 underline-offset-2 [&::-webkit-details-marker]:hidden">
            {s("lens.startersLinkFmt").replace("{count}", String(starters.length))}
            <span aria-hidden="true" className="inline-block">
              ▾
            </span>
          </summary>
          <ul className="mt-2 list-none space-y-1.5 pl-0">
            {starters.map((starter) => (
              <li key={starter} className="font-body text-[14px] leading-relaxed text-ink-body">
                {starter}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
