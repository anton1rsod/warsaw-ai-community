import type { Route } from "next";
import { s } from "@/lib/i18n/strings";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Pill } from "@/app/components/Pill";
import { ListItem } from "@/app/components/ListItem";
import { EmptyState } from "@/app/components/EmptyState";
import {
  listMeetingsFromSnapshot,
  listEventsFromSnapshot,
} from "@/lib/content-snapshot";

type Filter = "all" | "events" | "meetings";

function isFilter(v: unknown): v is Filter {
  return v === "events" || v === "meetings";
}

interface CalendarPageProps {
  searchParams: Promise<{ filter?: string }>;
}

interface CalendarItem {
  type: "event" | "meeting";
  href: Route;
  title: string;
  date: string;
}

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const filter: Filter = isFilter(params.filter) ? params.filter : "all";

  const today = new Date().toISOString().slice(0, 10);
  const meetings = listMeetingsFromSnapshot();
  const events = listEventsFromSnapshot();

  const items: CalendarItem[] = [
    ...(filter !== "events"
      ? meetings.map<CalendarItem>((m) => ({
          type: "meeting",
          href: `/meetings/${m.slug}` as Route,
          title: m.title,
          date: m.date,
        }))
      : []),
    ...(filter !== "meetings"
      ? events.map<CalendarItem>((e) => ({
          type: "event",
          href: `/events/${e.slug}` as Route,
          title: e.title,
          date: e.date,
        }))
      : []),
  ];

  const upcoming = items
    .filter((i) => i.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>{s("calendar.kicker")}</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {s("calendar.title")}
      </h1>

      {/* H62: filter chips encode state in URL — using Pill; active = going (bg-ink), inactive = dashed */}
      <nav aria-label="Filter" className="mt-3 flex flex-wrap gap-2">
        <Pill variant={filter === "all" ? "going" : "dashed"} href={"/calendar" as Route}>
          {s("calendar.filter.all")}
        </Pill>
        <Pill
          variant={filter === "events" ? "going" : "dashed"}
          href={"/calendar?filter=events" as Route}
        >
          {s("calendar.filter.events")}
        </Pill>
        <Pill
          variant={filter === "meetings" ? "going" : "dashed"}
          href={"/calendar?filter=meetings" as Route}
        >
          {s("calendar.filter.meetings")}
        </Pill>
        <Pill variant="dashed" href={"/api/calendar.ics" as Route}>
          {s("calendar.subscribe")}
        </Pill>
      </nav>

      <section aria-labelledby="upcoming-heading" className="mt-8">
        <MonoLabel>{s("calendar.upcoming")}</MonoLabel>
        <h2 id="upcoming-heading" className="sr-only">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            headline={s("empty.calendar.headline")}
            calibration={s("empty.calendar.calibration")}
          />
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {upcoming.map((item) => (
              <li key={`${item.type}-${item.href}`}>
                <ListItem
                  href={item.href}
                  title={item.title}
                  meta={item.date}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
