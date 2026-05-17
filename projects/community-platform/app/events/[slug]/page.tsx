import { notFound } from "next/navigation";
import { findEventBySlug, listEventsFromSnapshot } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";
import { AddToCalendarButton } from "@/app/components/AddToCalendarButton";
import { eventToIcsEvent, generateIcs } from "@/lib/ical";
import { getDefaults } from "@/lib/community-defaults";
import { EventRsvpButton } from "@/app/components/EventRsvpButton";
import { EventRoster } from "@/app/components/EventRoster";

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

      {/* O6 lock: SSG-only — page renders at build time with no session context.
          initialState="not-signed-in" ships the sign-in CTA for all visitors;
          a future v0.3.1 dynamic variant will derive per-visitor state. */}
      <EventRsvpButton eventSlug={event.slug} initialState="not-signed-in" />

      <article className="prose dark:prose-invert">
        <SafeHtml html={html} />
      </article>

      <EventRoster eventSlug={event.slug} />

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
