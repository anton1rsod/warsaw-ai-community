import { notFound } from "next/navigation";
import {
  findEventBySlug,
  findMemberByHandle,
  listEventsFromSnapshot,
} from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";
import { AddToCalendarButton } from "@/app/components/AddToCalendarButton";
import { eventToIcsEvent, generateIcs } from "@/lib/ical";
import { getDefaults } from "@/lib/community-defaults";
import { EventRsvpButton } from "@/app/components/EventRsvpButton";
import { EventRoster } from "@/app/components/EventRoster";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { createGitHubApp } from "@/lib/github-app";
import { parseProfileFrontmatter } from "@/lib/profile-editor";

// v0.4.8: flipped from `force-static` to `force-dynamic`. The page needs
// request-time `auth()` to (a) render the Header with the signed-in chip
// and (b) derive the EventRsvpButton initialState + profileSha from the
// viewer's profile. The v0.4.7 client-hydration in EventRsvpButton remains
// as defense-in-depth (no-op when initialState !== "not-signed-in").
export const dynamic = "force-dynamic";

// generateStaticParams is unused by force-dynamic pages but kept for the
// fallback case (e.g. if a future ADR re-enables ISR) and to satisfy the
// existing snapshot-source test contract.
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listEventsFromSnapshot().map((e) => ({ slug: e.slug }));
}

interface ViewerRsvp {
  state: "going" | "interested" | "none";
  profileSha: string;
}

/**
 * Derive the signed-in viewer's RSVP state + profileSha for this event.
 * Returns null when the viewer is anonymous, not a roster member, or when
 * the GitHub App read fails — caller falls back to the anon CTA.
 *
 * One GitHub API call per signed-in page view. Acceptable for current
 * community scale; if hot we can swap to snapshot-only state (snapshot
 * already carries `member.profile.data.events_going`) + a separate SHA
 * fetch only on first interaction.
 */
async function loadViewerRsvp(eventSlug: string): Promise<ViewerRsvp | null> {
  const session = await auth();
  if (!session?.githubHandle) return null;

  const member = findMemberByHandle(session.githubHandle);
  if (!member) return null;

  const gh = createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });

  let file: Awaited<ReturnType<typeof gh.readFile>>;
  try {
    file = await gh.readFile(`community/members/${member.slug}.md`);
  } catch {
    return null;
  }
  if (!file) return null;

  const { fm } = parseProfileFrontmatter(file.content);
  const state: ViewerRsvp["state"] = fm.events_going.includes(eventSlug)
    ? "going"
    : fm.events_interested.includes(eventSlug)
      ? "interested"
      : "none";

  return { state, profileSha: file.sha };
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

  const viewerRsvp = await loadViewerRsvp(event.slug);

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

      <EventRsvpButton
        eventSlug={event.slug}
        initialState={viewerRsvp?.state ?? "not-signed-in"}
        profileSha={viewerRsvp?.profileSha}
      />

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
