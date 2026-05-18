import Link from "next/link";
import type { Route } from "next";
import { s } from "@/lib/i18n/strings";

/**
 * Signed-in `/home` "Your week" dashboard pane — Q1.3 / D25 / O9.
 *
 * Data sources (O9 lock):
 *   1. Next RSVP commitment — derived from event_rsvps.json by member handle.
 *   2. Status compose CTA — static link to /this-week (no data read).
 *   3. Optional kudos-this-week count — derived from lib/kudos.ts (existing v0.3).
 *
 * §14.6 manipulation-resistance: passive surface. NO streak counter, NO
 * notifications, NO "you missed 2 weeks" guilt. Counts what HAPPENED;
 * never pressures what SHOULD. Forward-defense test asserts the DOM
 * contains no /streak|missed|don't break the chain/ copy.
 */
interface NextRsvp {
  slug: string;
  title: string;
  date: string;
}

interface YourWeekPaneProps {
  nextRsvp: NextRsvp | null;
  kudosWeekCount: number;
}

export function YourWeekPane({
  nextRsvp,
  kudosWeekCount,
}: YourWeekPaneProps): React.JSX.Element {
  return (
    <section
      aria-labelledby="your-week-heading"
      className="mb-8 rounded border border-neutral-200 p-6"
    >
      <h2
        id="your-week-heading"
        className="text-xs uppercase tracking-wider text-neutral-500 mb-3"
      >
        {s("home.yourWeek.heading")}
      </h2>

      {nextRsvp ? (
        <p className="text-neutral-900">
          {s("home.yourWeek.nextRsvp")}{" "}
          <Link
            href={`/events/${nextRsvp.slug}` as Route}
            className="underline"
          >
            {nextRsvp.title}
          </Link>{" "}
          — {nextRsvp.date}
        </p>
      ) : (
        <p className="text-sm text-neutral-600">{s("home.yourWeek.empty")}</p>
      )}

      <p className="mt-3 text-sm">
        <Link
          href="/this-week"
          className="text-accent-700 underline"
        >
          {s("home.yourWeek.statusCta")}
        </Link>
      </p>

      {kudosWeekCount > 0 && (
        <p className="mt-3 text-sm text-neutral-600">
          {s("home.yourWeek.kudosWeek")}: {kudosWeekCount}
        </p>
      )}
    </section>
  );
}
