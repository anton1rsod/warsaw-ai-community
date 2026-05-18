import Link from "next/link";
import type { Route } from "next";
import { s } from "@/lib/i18n/strings";
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

function filterChipClasses(active: boolean): string {
  const base = "inline-flex items-center rounded-full px-4 py-1.5 text-sm border";
  if (active) {
    return `${base} border-accent-600 bg-accent-50 text-accent-700`;
  }
  return `${base} border-neutral-200 text-neutral-700 hover:bg-neutral-50`;
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
    <main id="main" className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">{s("calendar.title")}</h1>

      {/* H62: filter chips encode state in URL */}
      <nav aria-label="Filter" className="flex flex-wrap gap-2 mb-8">
        <Link href={"/calendar" as Route} className={filterChipClasses(filter === "all")}>
          {s("calendar.filter.all")}
        </Link>
        <Link
          href={"/calendar?filter=events" as Route}
          className={filterChipClasses(filter === "events")}
        >
          {s("calendar.filter.events")}
        </Link>
        <Link
          href={"/calendar?filter=meetings" as Route}
          className={filterChipClasses(filter === "meetings")}
        >
          {s("calendar.filter.meetings")}
        </Link>
      </nav>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
          {s("calendar.upcoming")}
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            headline={s("empty.calendar.headline")}
            calibration={s("empty.calendar.calibration")}
          />
        ) : (
          <ul className="divide-y divide-neutral-200">
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

      <div className="mt-12">
        <Link
          href={"/api/calendar.ics" as Route}
          className="inline-flex items-center text-sm text-accent-700 underline"
        >
          {s("calendar.subscribe")}
        </Link>
      </div>
    </main>
  );
}
