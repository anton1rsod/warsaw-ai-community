import Link from "next/link";
import { notFound } from "next/navigation";
import { findMeetingBySlug, listMeetingsFromSnapshot } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";
import { AddToCalendarButton } from "@/app/components/AddToCalendarButton";
import { ThankButton } from "@/app/components/ThankButton";
import { MonoLabel } from "@/app/components/MonoLabel";
import { meetingToIcsEvent, generateIcs } from "@/lib/ical";
import { getDefaults } from "@/lib/community-defaults";
import { s } from "@/lib/i18n/strings";

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

  const metaParts: string[] = [];
  if (meeting.startTime) metaParts.push(meeting.startTime);
  if (meeting.durationMinutes) metaParts.push(`${meeting.durationMinutes} min`);
  if (meeting.location) metaParts.push(meeting.location);

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/meetings" className="font-voice text-[11px] text-dust underline underline-offset-2">
        {s("meetings.detail.backLink")}
      </Link>
      <MonoLabel as="p" >{meeting.date}</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {meeting.title}
      </h1>
      {metaParts.length > 0 ? (
        <p className="mt-2 font-voice text-[11px] text-dust">
          {metaParts.join(" · ")}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <AddToCalendarButton ics={ics} filename={`${meeting.slug}.ics`} />
        {meeting.host ? (
          <ThankButton
            recipient={meeting.host}
            itemType="meeting"
            itemId={meeting.slug}
            initialState="not-signed-in"
          />
        ) : null}
      </div>

      <article className="prose-warm mt-8 bg-paper border-[1.5px] border-ink p-5">
        <SafeHtml html={html} />
      </article>
    </main>
  );
}
