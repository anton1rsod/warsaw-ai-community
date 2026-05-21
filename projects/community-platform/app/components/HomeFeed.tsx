import type { HomeFeedData, FeedItem } from "@/lib/home-feed";
import { DateTime } from "@/app/components/DateTime";
import { MonoLabel } from "@/app/components/MonoLabel";
import { s } from "@/lib/i18n/strings";

interface HomeFeedProps {
  feed: HomeFeedData;
  showRecent?: boolean;
}

/**
 * v0.6 Phase 3.3: single-feed-strip aesthetic.
 *
 * Option B keeps the existing `feed: HomeFeedData` prop (and `showRecent`)
 * so the three consuming pages (app/page.tsx, app/home/page.tsx,
 * app/this-week/page.tsx) don't churn. Internally we flatten thisWeek+recent
 * into one card list and render the v0.6 MonoLabel header + amber-border
 * ship cards + paper-bg, with an evergreen empty-state when both buckets
 * are empty.
 *
 * Count semantics: "// this week · N ships" mirrors thisWeek.length (the
 * activity that landed in the current week bucket). Recent cards are still
 * shown beneath when showRecent=true, but they don't bump the headline ship
 * count.
 *
 * H45 preserved: showRecent=false AND thisWeek empty → return null.
 */
function TypeIcon({ type }: { type: FeedItem["type"] }): React.JSX.Element {
  const symbol =
    type === "meeting"
      ? "📅"
      : type === "event"
        ? "🎟"
        : type === "status"
          ? "✍"
          : "🛠";
  return (
    <span aria-hidden="true" className="inline-block w-4 text-[12px]">
      {symbol}
    </span>
  );
}

function ShipCard({ item }: { item: FeedItem }): React.JSX.Element {
  return (
    <li
      data-feed-card
      className="bg-paper border-l-[3px] border-accent-500 px-3 py-2 flex items-center gap-2 text-[12px]"
    >
      <TypeIcon type={item.type} />
      {item.author ? (
        <span className="font-voice font-bold text-dust">@{item.author}</span>
      ) : null}
      <a
        className="font-display italic flex-1 text-ink hover:underline"
        href={item.href}
      >
        {item.title}
      </a>
      <span className="font-voice text-dust">
        <DateTime iso={item.date} context="list" />
      </span>
    </li>
  );
}

export function HomeFeed({
  feed,
  showRecent = true,
}: HomeFeedProps): React.JSX.Element | null {
  // H45: when showRecent=false AND thisWeek empty, hide entirely.
  if (!showRecent && feed.thisWeek.length === 0) return null;

  const shipCount = feed.thisWeek.length;
  const label =
    shipCount === 0
      ? s("hero.home.shipsLabelNone")
      : s("hero.home.shipsLabelFmt").replace("{count}", String(shipCount));

  const items = showRecent ? [...feed.thisWeek, ...feed.recent] : feed.thisWeek;
  const isEmpty = items.length === 0;

  return (
    <section aria-labelledby="ships-feed" className="space-y-3">
      <MonoLabel>{label}</MonoLabel>
      <h2 id="ships-feed" className="sr-only">
        {s("home.thisWeek.heading")}
      </h2>
      {isEmpty ? (
        <div className="bg-paper border-[1.5px] border-ink p-4">
          <p className="font-display italic text-ink text-[14px]">
            {s("empty.home.ships")}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <ShipCard key={item.type + ":" + item.slug} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
