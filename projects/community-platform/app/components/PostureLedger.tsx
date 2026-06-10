import { MemberKicker } from "@/app/components/MemberKicker";
import { s } from "@/lib/i18n/strings";

interface PostureLedgerProps {
  bullish: string | null;
  skeptical: string | null;
  failurePatterns: string | null;
  successPatterns: string | null;
}

/**
 * Posture text is rendered as TEXT, not HTML: the raw markdown section
 * string is trimmed and paragraph breaks collapse to single newlines, then
 * React's escaping renders it verbatim inside a whitespace-pre-line <dd>.
 * No SafeHtml needed because no HTML is injected — simpler and safe
 * (posture sections are short prose; H143's sanitizer pipeline is for the
 * SafeHtml insertion path only).
 */
function plainLines(md: string): string {
  return md.trim().replace(/\n{2,}/g, "\n");
}

function PostureRow({
  label,
  text,
}: {
  label: string;
  text: string;
}): React.JSX.Element {
  return (
    <div className="py-3 min-[560px]:grid min-[560px]:grid-cols-[120px_1fr] min-[560px]:gap-4">
      <dt className="font-voice text-[11px] font-medium uppercase tracking-[0.09em] text-dust">
        {label}
      </dt>
      <dd className="m-0 whitespace-pre-line font-body text-[15px] leading-relaxed text-ink-body">
        {text}
      </dd>
    </div>
  );
}

/**
 * v0.12 §3 / task 2.3 lock — failure/success pattern sections do NOT render
 * here: they live in StorySection's "Patterns I keep seeing" details row
 * (the page concatenates them into patternsHtml). The props stay in the
 * signature per the v0.12 shared component contract so placement can move
 * later without a page-level signature change (precedent: Avatar's
 * void _photoOptOut).
 */
export function PostureLedger({
  bullish,
  skeptical,
  failurePatterns,
  successPatterns,
}: PostureLedgerProps): React.JSX.Element | null {
  void failurePatterns;
  void successPatterns;

  if (bullish === null && skeptical === null) return null;

  return (
    <section className="relative mt-14">
      <MemberKicker label={s("members.detail.postureSection")} />
      <dl className="mt-3 divide-y divide-hairline border-y border-hairline">
        {bullish !== null ? (
          <PostureRow label={s("members.detail.bullishRow")} text={plainLines(bullish)} />
        ) : null}
        {skeptical !== null ? (
          <PostureRow label={s("members.detail.skepticalRow")} text={plainLines(skeptical)} />
        ) : null}
      </dl>
    </section>
  );
}
