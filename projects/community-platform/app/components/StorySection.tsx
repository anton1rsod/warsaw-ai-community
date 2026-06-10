import { SafeHtml } from "@/app/components/SafeHtml";
import { MemberKicker } from "@/app/components/MemberKicker";
import { s } from "@/lib/i18n/strings";

/**
 * v0.12 D8 — the deep persona narrative with progressive disclosure.
 *
 * H158 constraints (spec §3, adversarially verified):
 *   • never the "contents" display mode on details/summary/wrappers (WebKit bug),
 *   • no heading elements inside summary (role=button drops child heading
 *     semantics),
 *   • custom carets + decorative counts are aria-hidden,
 *   • native marker hidden via list-none + [&::-webkit-details-marker]:hidden
 *     (Safari needs the pseudo-element rule),
 *   • summary text reads sensibly without expanded/collapsed announcements.
 *
 * Career-arc fade: the first paragraph stays in the always-visible DOM; the
 * remainder lives inside a native <details> whose summary is the mono
 * "continue reading" link — JS-free, same-DOM text, no duplicate node. The
 * gradient overlay is decorative and hides via group-has once opened.
 *
 * H143: every HTML prop is pre-rendered by lib/markdown (sanitized) in the
 * page and inserted ONLY through SafeHtml. No parallel insertion path.
 */
interface StorySectionProps {
  careerArcHtml: string | null;
  hardWonHtml: string | null;
  patternsHtml: string | null;
  buyerHtml: string | null;
  builderHtml: string | null;
  competitorHtml: string | null;
  evidenceHtml: string | null;
  unrecognizedHtml: string | null;
  profileHtml: string | null;
}

const SUMMARY_ROW_CLASSES =
  "flex min-h-[24px] cursor-pointer list-none items-center justify-between gap-3 py-3 font-voice text-[12px] text-ink hover:bg-surface-soft [&::-webkit-details-marker]:hidden";

function countListItems(html: string): number {
  return (html.match(/<li[\s>]/g) ?? []).length;
}

function Caret(): React.JSX.Element {
  return (
    <span aria-hidden="true" className="text-ink-muted">
      ▾
    </span>
  );
}

function DetailsRow({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <details className="border-t border-hairline">
      <summary className={SUMMARY_ROW_CLASSES}>
        <span>
          {label}
          {count > 0 ? (
            <span aria-hidden="true" className="ml-2 text-ink-muted">
              · {count}
            </span>
          ) : null}
        </span>
        <Caret />
      </summary>
      <div className="pb-5 pt-1">{children}</div>
    </details>
  );
}

function splitAtFirstParagraph(html: string): { lead: string; rest: string | null } {
  const close = "</p>";
  const idx = html.indexOf(close);
  if (idx === -1) return { lead: html, rest: null };
  const rest = html.slice(idx + close.length).trim();
  return { lead: html.slice(0, idx + close.length), rest: rest === "" ? null : rest };
}

export function StorySection(props: StorySectionProps): React.JSX.Element | null {
  const {
    careerArcHtml,
    hardWonHtml,
    patternsHtml,
    buyerHtml,
    builderHtml,
    competitorHtml,
    evidenceHtml,
    unrecognizedHtml,
    profileHtml,
  } = props;

  const dispositionBlocks = [
    { label: s("members.detail.dispositionBuyer"), html: buyerHtml },
    { label: s("members.detail.dispositionBuilder"), html: builderHtml },
    { label: s("members.detail.dispositionCompetitor"), html: competitorHtml },
  ].filter((b): b is { label: string; html: string } => b.html !== null);

  const hasRows =
    hardWonHtml !== null ||
    patternsHtml !== null ||
    dispositionBlocks.length > 0 ||
    evidenceHtml !== null ||
    unrecognizedHtml !== null;

  const hasContent = profileHtml !== null || careerArcHtml !== null || hasRows;
  if (!hasContent) return null;

  const arc = careerArcHtml !== null ? splitAtFirstParagraph(careerArcHtml) : null;
  const dispositionCount = dispositionBlocks.reduce(
    (n, b) => n + countListItems(b.html),
    0,
  );

  return (
    <section className="relative mt-14">
      <MemberKicker label={s("members.detail.storySection")} />
      <div className="mt-3">
        {profileHtml !== null ? (
          <SafeHtml html={profileHtml} className="prose-warm mb-6" />
        ) : null}

        {arc !== null ? (
          <div className="group mb-6">
            <div className="relative">
              <SafeHtml html={arc.lead} className="prose-warm" />
              {arc.rest !== null ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-cream to-transparent group-has-[[open]]:hidden"
                />
              ) : null}
            </div>
            {arc.rest !== null ? (
              <details>
                <summary className="inline-flex min-h-[24px] cursor-pointer list-none items-center gap-1 py-1 font-voice text-[12px] text-ink underline decoration-accent-500 underline-offset-2 hover:text-dust [&::-webkit-details-marker]:hidden">
                  {s("members.detail.continueReading")}
                  <Caret />
                </summary>
                <SafeHtml html={arc.rest} className="prose-warm mt-3" />
              </details>
            ) : null}
          </div>
        ) : null}

        {hasRows ? (
          <div className="border-b border-hairline">
            {hardWonHtml !== null ? (
              <DetailsRow
                label={s("members.detail.storyHardWon")}
                count={countListItems(hardWonHtml)}
              >
                <SafeHtml html={hardWonHtml} className="prose-warm" />
              </DetailsRow>
            ) : null}
            {patternsHtml !== null ? (
              <DetailsRow
                label={s("members.detail.storyPatterns")}
                count={countListItems(patternsHtml)}
              >
                <SafeHtml html={patternsHtml} className="prose-warm" />
              </DetailsRow>
            ) : null}
            {dispositionBlocks.length > 0 ? (
              <DetailsRow
                label={s("members.detail.storyDispositions")}
                count={dispositionCount}
              >
                {dispositionBlocks.map((b) => (
                  <div key={b.label} className="mb-4">
                    <p className="font-voice text-[11px] uppercase tracking-[0.09em] text-dust">
                      {b.label}
                    </p>
                    <SafeHtml html={b.html} className="prose-warm mt-1" />
                  </div>
                ))}
              </DetailsRow>
            ) : null}
            {evidenceHtml !== null ? (
              <DetailsRow
                label={s("members.detail.storyEvidence")}
                count={countListItems(evidenceHtml)}
              >
                <SafeHtml html={evidenceHtml} className="prose-warm" />
              </DetailsRow>
            ) : null}
            {unrecognizedHtml !== null ? (
              <DetailsRow label={s("members.detail.storyMore")} count={0}>
                <SafeHtml html={unrecognizedHtml} className="prose-warm" />
              </DetailsRow>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
