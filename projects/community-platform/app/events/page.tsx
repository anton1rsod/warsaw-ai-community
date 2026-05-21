import { listEventsFromSnapshot, isAdmin } from "@/lib/content-snapshot";
import rostersData from "@/lib/__generated__/event-rosters.json";
import type { Event } from "@/lib/events";
import { auth } from "@/lib/auth";
import { s } from "@/lib/i18n/strings";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Pill } from "@/app/components/Pill";
import { EventCard } from "@/app/components/EventCard";

// v0.5.1 H86: flipped from `force-static` → `force-dynamic`. The page needs
// request-time `auth()` to (a) gate the admin "+ new event" button via
// `isAdmin()` (H81) and (b) propagate force-dynamic through the layout so the
// Header signed-in chip server-renders (same chat-30 fix applied to
// /events/[slug] — see that file's lines 19-23 for the precedent).
export const dynamic = "force-dynamic";

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

  // H81: server-side admin gate; runs at request time because of force-dynamic.
  const session = await auth();
  const viewerIsAdmin =
    session?.githubHandle != null && isAdmin(session.githubHandle);

  const eventsLabel = s("events.index.eventsLabelFmt").replace(
    "{count}",
    String(upcoming.length),
  );

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>{eventsLabel}</MonoLabel>
      <h1 className="mt-2 font-display italic font-black text-[40px] leading-[0.95] tracking-tight text-ink">
        {s("events.index.title")}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {viewerIsAdmin ? (
          <Pill variant="solid" href="/admin/events/new">
            {s("events.index.newEvent")}
          </Pill>
        ) : null}
        <Pill variant="dashed" href="/api/calendar.ics">
          {s("events.index.subscribeIcs")}
        </Pill>
      </div>

      <section aria-labelledby="upcoming-heading" className="mt-8">
        <MonoLabel>{s("events.index.upcomingLabel")}</MonoLabel>
        <h2 id="upcoming-heading" className="sr-only">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 font-display italic text-[14px] text-dust">
            {s("empty.events.upcoming")}
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {upcoming.map((e) => (
              <li key={e.slug}>
                <EventCard
                  slug={e.slug}
                  title={e.title}
                  date={e.date}
                  startTime={e.startTime}
                  location={e.location}
                  goingCount={countTotal(e.slug, "going")}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="past-heading" className="mt-8">
        <MonoLabel>{s("events.index.pastLabel")}</MonoLabel>
        <h2 id="past-heading" className="sr-only">
          Past
        </h2>
        {past.length === 0 ? (
          <p className="mt-2 font-display italic text-[14px] text-dust">
            {s("empty.events.past")}
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {past.map((e) => (
              <li key={e.slug}>
                <EventCard
                  slug={e.slug}
                  title={e.title}
                  date={e.date}
                  startTime={e.startTime}
                  location={e.location}
                  goingCount={countTotal(e.slug, "going")}
                  hoverLift={false}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
