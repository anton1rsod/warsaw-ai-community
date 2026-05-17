import Link from "next/link";
import { notFound } from "next/navigation";
import { findMeetingBySlug, listMeetingsFromSnapshot } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";
import { AddToCalendarButton } from "@/app/components/AddToCalendarButton";
import { meetingToIcsEvent, generateIcs } from "@/lib/ical";
import { getDefaults } from "@/lib/community-defaults";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listMeetingsFromSnapshot().map((m) => ({ slug: m.slug }));
}

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const meeting = findMeetingBySlug(slug);
  if (!meeting) notFound();

  const html = await renderMarkdownToHtml(meeting.body);
  const defaults = getDefaults();
  const ics = generateIcs([meetingToIcsEvent(meeting, defaults)]);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/meetings" className="text-sm underline">
        ← Meetings
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
        {meeting.startTime ? <span>{meeting.startTime}</span> : null}
        {meeting.durationMinutes ? <span>· {meeting.durationMinutes} min</span> : null}
        {meeting.location ? <span>· {meeting.location}</span> : null}
        <AddToCalendarButton ics={ics} filename={`${meeting.slug}.ics`} />
      </div>
      <article className="mt-4">
        <SafeHtml
          html={html}
          className="prose prose-neutral dark:prose-invert max-w-none"
        />
      </article>
    </main>
  );
}
