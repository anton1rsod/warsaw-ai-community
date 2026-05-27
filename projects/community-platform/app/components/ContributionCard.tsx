import type { Contributions } from "@/lib/contributions";
import { s } from "@/lib/i18n/strings";

interface ContributionCardProps {
  contributions: Contributions;
}

export function ContributionCard({
  contributions,
}: ContributionCardProps): React.JSX.Element {
  const items: { label: string; value: number }[] = [
    { label: "Project commits", value: contributions.projectCommits },
    { label: "ADRs filed", value: contributions.adrsFiled },
    { label: "Meetings attended", value: contributions.meetingsAttended },
    { label: "Status posts", value: contributions.statusPosts },
  ];

  return (
    <section className="border-[1.5px] border-ink bg-paper p-4">
      <h3 className="font-display font-semibold text-ink">{s("members.detail.contributions")}</h3>
      <p className="mt-1 font-voice text-[10px] text-dust">
        {s("members.detail.contributionsNote")}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="border border-ink p-3"
          >
            <dd className="font-display text-2xl font-semibold tabular-nums text-ink">{it.value}</dd>
            <dt className="font-voice text-[10px] text-dust">
              {it.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
