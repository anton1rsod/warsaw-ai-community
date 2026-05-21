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
import { AmberTag } from "@/app/components/AmberTag";
import { MonoLabel } from "@/app/components/MonoLabel";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { createGitHubApp } from "@/lib/github-app";
import { parseProfileFrontmatter } from "@/lib/profile-editor";
import { s } from "@/lib/i18n/strings";

// v0.4.8: flipped from `force-static` to `force-dynamic`. The page needs
// request-time `auth()` to (a) render the Header with the signed-in chip
// and (b) derive the EventRsvpButton initialState + profileSha from the
// viewer's profile. The v0.4.7 client-hydration in EventRsvpButton remains
// as defense-in-depth (no-op when initialState !== "not-signed-in").
//
// v0.6 (Task 3.5) preserves both contracts byte-identical — H89 grep test
// in tests/unit/events-slug-page.test.tsx asserts `export const dynamic`
// and `loadViewerRsvp` continue to live in this file.
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

const MONTHS_LOWER = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/**
 * Format an ISO date as "21 may" for the monoLead pre-header.
 *
 * The brief template proposed `event.date.slice(5).replace("-", " ")` which
 * yields "05 21" — wrong order, numeric month. The §16.4 mockup wants
 * "21 may" (day-first, 3-char lowercase month). This helper parses the ISO
 * date and formats accordingly.
 */
function formatDateForLead(dateISO: string): string {
  const parts = dateISO.split("-");
  const mo = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  const monthIndex = Math.max(0, Math.min(11, mo - 1));
  return `${d} ${MONTHS_LOWER[monthIndex] ?? "jan"}`;
}

/**
 * Returns the AmberTag suffix label for proximity ("tonight." on event-day,
 * "this week." within 1-6 days, null otherwise). Compares calendar days,
 * not wall-clock — anchored to local midnight on both sides so an event
 * starting at 19:00 on "today" still returns "tonight." even when called
 * at 22:00 the same evening.
 */
function todaySuffix(dateISO: string, now: Date): string | null {
  const parts = dateISO.split("-");
  const y = parseInt(parts[0] ?? "0", 10);
  const mo = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  const eventDay = new Date(y, mo - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((eventDay.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return s("events.detail.tonightSuffix");
  if (diffDays >= 1 && diffDays <= 6) return s("events.detail.thisWeekSuffix");
  return null;
}

/**
 * Extract the meetup number from a title. Handles "AI Community № 4",
 * "AI Community Meetup #4", "Meetup № 04", etc. Returns "0" when no number
 * is present (e.g., "Hackathon"). Always zero-padded to 2 digits.
 */
function meetupNumberFromTitle(title: string): string {
  const m = title.match(/№\s*(\d+)/i) ?? title.match(/#(\d+)/);
  const raw = m?.[1] ?? "0";
  return raw.padStart(2, "0");
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

  const now = new Date();
  const suffix = todaySuffix(event.date, now);
  const monoLead = s("events.detail.monoLeadFmt")
    .replace("{num}", meetupNumberFromTitle(event.title))
    .replace("{date}", formatDateForLead(event.date))
    .replace("{time}", event.startTime ?? "");

  // v0.6 meta line under H1 excludes startTime to avoid duplication with the
  // monoLead pre-header. Per §16.4 mockup: "120 min · Grzybowska 85a · hosted
  // by @anton1rsod".
  const metaParts: string[] = [];
  if (event.durationMinutes) metaParts.push(`${event.durationMinutes} min`);
  if (event.location) metaParts.push(event.location);
  if (event.host) metaParts.push(`hosted by @${event.host}`);

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>{monoLead}</MonoLabel>
      <h1 className="mt-2 font-display italic font-black text-[36px] leading-[0.95] tracking-tight text-ink">
        {event.title}
        {suffix ? (
          <>
            {" "}
            <AmberTag>{suffix}</AmberTag>
          </>
        ) : null}
      </h1>
      {metaParts.length > 0 ? (
        <div className="mt-2 font-voice text-[11px] text-ink">
          {metaParts.join(" · ")}
        </div>
      ) : null}
      {event.status === "cancelled" ? (
        <p className="mt-3 rounded bg-red-50 px-3 py-1 text-sm text-red-800 dark:bg-red-900/40 dark:text-red-200">
          This event has been cancelled.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <EventRsvpButton
          eventSlug={event.slug}
          initialState={viewerRsvp?.state ?? "not-signed-in"}
          profileSha={viewerRsvp?.profileSha}
        />
        <AddToCalendarButton ics={ics} filename={`${event.slug}.ics`} />
      </div>

      <article className="prose mt-8 bg-paper border-[1.5px] border-ink p-5 dark:prose-invert">
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
