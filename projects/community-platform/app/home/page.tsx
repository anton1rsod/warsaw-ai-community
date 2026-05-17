import { HomeFeed } from "@/app/components/HomeFeed";
import { computeHomeFeed } from "@/lib/home-feed";
import {
  listMeetingsFromSnapshot,
  listEventsFromSnapshot,
} from "@/lib/content-snapshot";
import { env } from "@/lib/env";

// H30: SSG, no auth() read. Public-by-default per ADR-0012.
export const dynamic = "force-static";

function loadFeedData() {
  return computeHomeFeed({
    meetings: listMeetingsFromSnapshot(),
    events: listEventsFromSnapshot(),
    statusPosts: [],
    contributions: [],
    now: new Date(),
  });
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const feed = loadFeedData();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">{env.COMMUNITY_NAME}</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Discovery + decisions + ship cadence
        </p>
      </header>
      <HomeFeed feed={feed} />
      <nav className="mt-10 grid gap-3 sm:grid-cols-2">
        <a className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900" href="/events">Events</a>
        <a className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900" href="/meetings">Meetings</a>
        <a className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900" href="/projects">Projects</a>
        <a className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900" href="/decisions">Decisions</a>
      </nav>
    </main>
  );
}
