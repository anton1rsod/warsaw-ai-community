import { listEventsFromSnapshot } from "@/lib/content-snapshot";
import rostersData from "@/lib/__generated__/event-rosters.json";
import type { Event } from "@/lib/events";

export const dynamic = "force-static";

interface RosterEntry {
  going: { publicSlugs: string[]; hiddenCount: number };
  interested: { publicSlugs: string[]; hiddenCount: number };
}
const rosters: Record<string, RosterEntry> = rostersData as Record<string, RosterEntry>;

function countTotal(slug: string, side: "going" | "interested"): number {
  const r = rosters[slug];
  if (!r) return 0;
  return r[side].publicSlugs.length + r[side].hiddenCount;
}

function splitEvents(
  events: readonly Event[],
  todayISO: string,
): { upcoming: Event[]; past: Event[] } {
  const upcoming: Event[] = [];
  const past: Event[] = [];
  for (const e of events) {
    if (e.date >= todayISO) upcoming.push(e);
    else past.push(e);
  }
  upcoming.sort((a, b) => (a.date < b.date ? -1 : 1));
  past.sort((a, b) => (a.date < b.date ? 1 : -1));
  return { upcoming, past };
}

export default async function EventsIndex(): Promise<React.JSX.Element> {
  const events = listEventsFromSnapshot();
  const todayISO = new Date().toISOString().slice(0, 10);
  const { upcoming, past } = splitEvents(events, todayISO);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Events</h1>
        <a className="text-sm underline hover:no-underline" href="/api/calendar.ics">
          Subscribe to calendar (ICS)
        </a>
      </header>

      <section className="mb-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">No upcoming events.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {upcoming.map((e) => (
              <li key={e.slug} className="py-2">
                <a className="block hover:underline" href={`/events/${e.slug}`}>
                  <span className="font-medium">{e.date}</span>
                  <span className="ml-2">— {e.title}</span>
                  <span className="ml-2 text-sm text-neutral-500">
                    [{countTotal(e.slug, "going")} going]
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Past
        </h2>
        {past.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">No past events yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {past.map((e) => (
              <li key={e.slug} className="py-2">
                <a className="block hover:underline" href={`/events/${e.slug}`}>
                  <span className="font-medium">{e.date}</span>
                  <span className="ml-2">— {e.title}</span>
                  <span className="ml-2 text-sm text-neutral-500">
                    [{countTotal(e.slug, "going")} went]
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
