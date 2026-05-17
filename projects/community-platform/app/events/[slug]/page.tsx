import { notFound } from "next/navigation";
import { findEventBySlug, listEventsFromSnapshot } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";
import { AddToCalendarButton } from "@/app/components/AddToCalendarButton";
import { eventToIcsEvent, generateIcs } from "@/lib/ical";
import { getDefaults } from "@/lib/community-defaults";

export const dynamic = "force-static";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listEventsFromSnapshot().map((e) => ({ slug: e.slug }));
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const event = findEventBySlug(slug);
  if (!event) notFound();

  const html = await renderMarkdownToHtml(event.body);
  const defaults = getDefaults();
  const icsEvent = eventToIcsEvent(event, defaults);
  const ics = generateIcs([icsEvent]);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="mb-4">
        <h1 className="text-3xl font-semibold">{event.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
          <span>{event.date}</span>
          {event.startTime ? <span>· {event.startTime}</span> : null}
          {event.durationMinutes ? <span>· {event.durationMinutes} min</span> : null}
          {event.location ? <span>· {event.location}</span> : null}
          {event.host ? <span>· hosted by @{event.host}</span> : null}
          <AddToCalendarButton ics={ics} filename={`${event.slug}.ics`} />
        </div>
        {event.status === "cancelled" ? (
          <p className="mt-2 rounded bg-red-50 px-3 py-1 text-sm text-red-800 dark:bg-red-900/40 dark:text-red-200">
            This event has been cancelled.
          </p>
        ) : null}
      </header>

      {/* RSVP slot — wired in Task 3.3 (EventRsvpButton) */}

      <article className="prose dark:prose-invert">
        <SafeHtml html={html} />
      </article>

      {/* Roster slot — wired in Task 3.4 (EventRoster) */}

      {event.url ? (
        <p className="mt-6 text-sm">
          <a className="underline" href={event.url} rel="noopener noreferrer" target="_blank">
            External page ↗
          </a>
        </p>
      ) : null}
    </main>
  );
}
