import { s } from "@/lib/i18n/strings";

/**
 * v0.12 D5 — the page's one expressive moment: the member's
 * `my_typical_first_question` as a pull-quote with a hanging amber asterisk
 * (the brand mark doing typographic work). The asterisk is decorative →
 * aria-hidden. The page only renders this component when firstQuestion is
 * non-null, but the component also guards a blank question → null (defense
 * in depth against a whitespace-only parsed section).
 *
 * H159 / SC 2.5.8: the ask-yours link carries an inline-flex min-h-[24px]
 * items-center box via padding-block — visual size unchanged. The ` · `
 * separator before it is decorative → aria-hidden (spec §3). askHref comes
 * from the page's O2 resolution (t.me deep-link or null).
 */
interface FirstQuestionQuoteProps {
  question: string;
  askHref: string | null;
}

export function FirstQuestionQuote({
  question,
  askHref,
}: FirstQuestionQuoteProps): React.JSX.Element | null {
  if (question.trim() === "") return null;

  return (
    <figure className="relative mt-16 pl-9">
      <span
        aria-hidden="true"
        className="absolute left-0 top-[-2px] font-display text-[34px] font-semibold leading-none text-accent-500"
      >
        *
      </span>
      <blockquote className="font-voice text-[19px] leading-normal tracking-[-0.01em] text-ink max-w-[30em]">
        &ldquo;{question}&rdquo;
      </blockquote>
      <figcaption className="mt-3 font-voice text-[11px] uppercase tracking-[0.09em] text-dust">
        {s("members.detail.firstQuestionCaption")}
        {askHref ? (
          <>
            <span aria-hidden="true" className="text-hairline-strong">
              {" · "}
            </span>
            <a
              className="inline-flex min-h-[24px] items-center py-1 text-accent-700 underline underline-offset-2 hover:text-ink"
              href={askHref}
            >
              {s("members.detail.askYours")}
            </a>
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}
