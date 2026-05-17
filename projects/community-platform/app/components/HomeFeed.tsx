import type { HomeFeedData, FeedItem } from "@/lib/home-feed";

interface HomeFeedProps {
  feed: HomeFeedData;
  showRecent?: boolean;
}

function TypeIcon({ type }: { type: FeedItem["type"] }): React.JSX.Element {
  const symbol = type === "meeting" ? "📅" : type === "event" ? "🎟" : type === "status" ? "✍" : "🛠";
  return <span aria-hidden="true" className="mr-2 inline-block w-4">{symbol}</span>;
}

function relativeDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso + "T12:00:00Z");
  const diffDays = Math.round((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 6) {
    return new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date);
  }
  if (diffDays < 0) {
    return `${Math.abs(diffDays)}d ago`;
  }
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ThisWeekItem({ item }: { item: FeedItem }): React.JSX.Element {
  return (
    <li className="flex items-start py-2">
      <TypeIcon type={item.type} />
      <div className="flex-1">
        <a className="font-medium hover:underline" href={item.href}>
          {escapeHtml(item.title)}
        </a>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {relativeDate(item.date)}
          {item.excerpt ? <span className="ml-2">— {escapeHtml(item.excerpt)}</span> : null}
        </div>
      </div>
    </li>
  );
}

function RecentItem({ item }: { item: FeedItem }): React.JSX.Element {
  return (
    <li className="flex items-center py-1 text-sm">
      <TypeIcon type={item.type} />
      <a className="hover:underline" href={item.href}>
        {escapeHtml(item.title)}
      </a>
      {item.author ? <span className="ml-2 text-neutral-500">@{escapeHtml(item.author)}</span> : null}
      <span className="ml-auto text-neutral-500">{relativeDate(item.date)}</span>
    </li>
  );
}

export function HomeFeed({ feed, showRecent = true }: HomeFeedProps): React.JSX.Element | null {
  // H45: when showRecent=false AND thisWeek empty, hide entirely.
  if (!showRecent && feed.thisWeek.length === 0) return null;
  const showEmpty = showRecent;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">This Week</h2>
        {feed.thisWeek.length === 0 ? (
          showEmpty ? (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Nothing scheduled this week — <a className="underline" href="/events">browse all events</a>.
            </p>
          ) : null
        ) : (
          <ul className="mt-1 divide-y divide-neutral-200 dark:divide-neutral-800">
            {feed.thisWeek.map((item) => (
              <ThisWeekItem key={item.type + ":" + item.slug} item={item} />
            ))}
          </ul>
        )}
      </div>

      {showRecent ? (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Recent</h2>
          {feed.recent.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              No recent activity. — <a className="underline" href="/projects">browse projects</a>.
            </p>
          ) : (
            <ul className="mt-1 divide-y divide-neutral-200 dark:divide-neutral-800">
              {feed.recent.map((item) => (
                <RecentItem key={item.type + ":" + item.slug} item={item} />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
