import { MemberKicker } from "@/app/components/MemberKicker";
import { s } from "@/lib/i18n/strings";
import type { PersonaTags } from "@/lib/persona";

/**
 * v0.12 D7 — chips are gone on the member page. Expertise renders as
 * definition-list ledger rows: mono label gutter (EXPERT / PRACTITIONER /
 * NICHE / LANGUAGES), inline lists right, depth hierarchy by tone (expert
 * medium ink, practitioner ink-muted). The Tag/chip component stays for
 * other surfaces; this component must never import it.
 *
 * Pooling: industries + functionalRoles + companyStages merge into ONE pool
 * and group by DEPTH, not by tag category. familiar-depth (and depth-null)
 * tags are NOT rendered — the approved mockup shows expert + practitioner
 * rows only. The ` · ` separators are decorative → aria-hidden (spec §3).
 */
interface ExpertiseLedgerProps {
  tags: PersonaTags;
  languages: string[];
}

function Separated({ labels }: { labels: string[] }): React.JSX.Element {
  return (
    <>
      {labels.map((label, i) => (
        <span key={label}>
          {i > 0 ? (
            <span aria-hidden="true" className="text-hairline-strong">
              {" · "}
            </span>
          ) : null}
          {label}
        </span>
      ))}
    </>
  );
}

function LedgerRow({
  label,
  ddClassName,
  children,
}: {
  label: string;
  ddClassName: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="py-3 min-[560px]:grid min-[560px]:grid-cols-[120px_1fr] min-[560px]:gap-4">
      <dt className="font-voice text-[11px] font-medium uppercase tracking-[0.09em] text-dust">
        {label}
      </dt>
      <dd className={`m-0 ${ddClassName}`}>{children}</dd>
    </div>
  );
}

export function ExpertiseLedger({
  tags,
  languages,
}: ExpertiseLedgerProps): React.JSX.Element | null {
  const pool = [...tags.industries, ...tags.functionalRoles, ...tags.companyStages];
  const expert = pool.filter((t) => t.depth === "expert").map((t) => t.label);
  const practitioner = pool
    .filter((t) => t.depth === "practitioner")
    .map((t) => t.label);

  const hasRows =
    expert.length > 0 ||
    practitioner.length > 0 ||
    tags.niche.length > 0 ||
    languages.length > 0;
  if (!hasRows) return null;

  return (
    <section className="relative mt-14">
      <MemberKicker label={s("members.detail.expertiseSection")} />
      <dl className="mt-3 divide-y divide-hairline border-y border-hairline">
        {expert.length > 0 ? (
          <LedgerRow
            label={s("members.detail.expertRow")}
            ddClassName="font-body text-[16.5px] font-medium text-ink"
          >
            <Separated labels={expert} />
          </LedgerRow>
        ) : null}
        {practitioner.length > 0 ? (
          <LedgerRow
            label={s("members.detail.practitionerRow")}
            ddClassName="font-body text-[15px] text-ink-muted"
          >
            <Separated labels={practitioner} />
          </LedgerRow>
        ) : null}
        {tags.niche.length > 0 ? (
          <LedgerRow
            label={s("members.detail.nicheRow")}
            ddClassName="font-body text-[15px] leading-relaxed text-ink-body"
          >
            {tags.niche.join(" · ")}
          </LedgerRow>
        ) : null}
        {languages.length > 0 ? (
          <LedgerRow
            label={s("members.detail.languagesRow")}
            ddClassName="font-body text-[15px] leading-relaxed text-ink-body"
          >
            {languages.join(", ")}
          </LedgerRow>
        ) : null}
      </dl>
    </section>
  );
}
