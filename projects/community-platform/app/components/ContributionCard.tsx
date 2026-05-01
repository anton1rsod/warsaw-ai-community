import type { Contributions } from "@/lib/contributions";

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
    <section className="rounded border p-4">
      <h3 className="text-lg font-medium">Contributions</h3>
      <p className="mt-1 text-xs text-neutral-500">
        Derived from git history. Bot commits excluded.
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <dd className="text-2xl font-semibold tabular-nums">{it.value}</dd>
            <dt className="text-xs text-neutral-600 dark:text-neutral-400">
              {it.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
