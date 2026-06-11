import type { Contributions } from "@/lib/contributions";
import type { EventSlug } from "@/lib/events";
import { s } from "@/lib/i18n/strings";

interface ActivityLineProps {
  contributions: Contributions;
  goingSlugs: EventSlug[];
  interestedSlugs: EventSlug[];
  kudosTotal: number;
}

function Sep(): React.JSX.Element {
  return (
    <span aria-hidden="true" className="text-hairline-strong">
      {" · "}
    </span>
  );
}

/**
 * v0.12 D9 — contributions demoted: one mono stat line in the footer carries
 * the evidence quietly (replaces ContributionCard + KudosCount + the events
 * list on this page). 12px mono dust on cream (4.60:1 AA — spec §3 pair
 * table). Event links get ≥24px hit areas (H159). Separators decorative →
 * aria-hidden (spec §3).
 */
export function ActivityLine({
  contributions,
  goingSlugs,
  interestedSlugs,
  kudosTotal,
}: ActivityLineProps): React.JSX.Element {
  const stats = [
    s("members.detail.activityCommitsFmt").replace("{n}", String(contributions.projectCommits)),
    s("members.detail.activityAdrsFmt").replace("{n}", String(contributions.adrsFiled)),
    s("members.detail.activityStatusFmt").replace("{n}", String(contributions.statusPosts)),
  ];

  return (
    <footer className="mt-14 border-t border-hairline pt-4">
      <p className="m-0 font-voice text-[12px] tabular-nums text-dust">
        {stats.map((stat, i) => (
          <span key={stat}>
            {i > 0 ? <Sep /> : null}
            {stat}
          </span>
        ))}
        {goingSlugs.map((slug) => (
          <span key={slug}>
            <Sep />
            <a
              href={`/events/${slug}`}
              className="inline-flex min-h-[24px] items-center py-1 text-ink hover:underline"
            >
              ✓ {slug}
            </a>
          </span>
        ))}
        {interestedSlugs.map((slug) => (
          <span key={slug}>
            <Sep />
            <a
              href={`/events/${slug}`}
              className="inline-flex min-h-[24px] items-center py-1 hover:underline"
            >
              ★ {slug}
            </a>
          </span>
        ))}
        <Sep />
        {s("members.detail.activityThankedFmt").replace("{n}", String(kudosTotal))}
      </p>
    </footer>
  );
}
