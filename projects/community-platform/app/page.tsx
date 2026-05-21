import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { findMemberByHandle, listEventsFromSnapshot } from "@/lib/content-snapshot";
import { AnonymousHero } from "@/app/components/AnonymousHero";
import { HomeFeed } from "@/app/components/HomeFeed";
import { computeHomeFeed } from "@/lib/home-feed";
import { formatTimeUntil } from "@/lib/time-until";

/**
 * ADR-0014 root route — anonymous-public hero landing (Q1.2) + signed-in
 * 302→/home preserving ?from=… when safe (H57).
 *
 * Cache-Control posture: this route is auth-aware → ƒ Dynamic per
 * recurring-plan-defects pattern 8. Anonymous responses MUST carry
 * `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`
 * to prevent edge-cache poisoning across the signed-in/anonymous branches
 * (H56).
 *
 * Signed-in branch returns 302 only; the redirect target is computed via
 * resolveSafeReturnTo (exported for test ergonomics).
 */

// Explicit force-dynamic: app/page.tsx is already dynamic in practice
// because it calls auth() (which reads cookies()), but stating the
// intent here makes the H56 `Cache-Control: private` posture
// regression-proof against future refactors that extract the anonymous
// branch into a cached sub-component above the auth check.
export const dynamic = "force-dynamic";

const SAFE_RETURN_TO = /^\/[a-z0-9\-_/]*$/;

export function resolveSafeReturnTo(input: string | undefined): string {
  if (!input) return "/home";
  if (!SAFE_RETURN_TO.test(input)) return "/home";
  if (input.startsWith("//")) return "/home";
  return input;
}

function pickNextEvent(): {
  slug: string;
  title: string;
  date: string;
  startTime?: string;
  location?: string;
  host?: string;
} | null {
  const events = listEventsFromSnapshot();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const next = upcoming[0];
  if (!next) return null;
  return {
    slug: next.slug,
    title: next.title,
    date: next.date,
    startTime: next.startTime,
    location: next.location,
    host: next.host,
  };
}

export default async function RootPage(): Promise<React.JSX.Element> {
  const session = await auth();
  const handle = session?.githubHandle ?? null;
  const member = handle ? findMemberByHandle(handle) : undefined;
  const signedIn = Boolean(member);

  if (signedIn) {
    const hdrs = await headers();
    const from = new URL(hdrs.get("referer") ?? "https://localhost", "https://localhost").searchParams.get("from") ?? undefined;
    redirect(resolveSafeReturnTo(from));
  }

  const now = new Date();
  const nextEvent = pickNextEvent();
  const timeUntil = nextEvent
    ? formatTimeUntil(nextEvent.date, nextEvent.startTime, now)
    : undefined;
  // v0.4 Event records don't carry markdown body (calendar entries, not
  // articles); supplying body: "" yields excerpt: undefined downstream
  // in eventToFeedItem (empty-string split returns [""] which fails the
  // .find(l => l.trim()) check). Replaces the prior `as unknown as ...`
  // double-cast which would have crashed at runtime if Event ever did
  // surface a body field with mismatched shape.
  const feed = computeHomeFeed({
    meetings: [],
    events: listEventsFromSnapshot().map((e) => ({
      date: e.date,
      slug: e.slug,
      title: e.title,
      body: "",
    })),
    statusPosts: [],
    contributions: [],
    now,
  });

  return (
    <>
      <AnonymousHero nextEvent={nextEvent} timeUntil={timeUntil} />
      <section className="mx-auto max-w-3xl px-4">
        <HomeFeed feed={feed} />
      </section>
    </>
  );
}
