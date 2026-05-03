import Link from "next/link";
import { notFound } from "next/navigation";
import { findMeetingBySlug, listMeetingsFromSnapshot } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";

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

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/meetings" className="text-sm underline">
        ← Meetings
      </Link>
      <article className="mt-4">
        <SafeHtml
          html={html}
          className="prose prose-neutral dark:prose-invert max-w-none"
        />
      </article>
    </main>
  );
}
