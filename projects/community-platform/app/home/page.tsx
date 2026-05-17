import { HomeHeader } from "@/app/components/HomeHeader";
import { HomeFeed } from "@/app/components/HomeFeed";
import { computeHomeFeed } from "@/lib/home-feed";
import {
  listMeetingsFromSnapshot,
  listEventsFromSnapshot,
} from "@/lib/content-snapshot";

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
      <HomeHeader />
      <HomeFeed feed={feed} />
      <nav className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Sections">
        <a className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900" href="/events">Events</a>
        <a className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900" href="/meetings">Meetings</a>
        <a className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900" href="/members">Members</a>
        <a className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900" href="/projects">Projects</a>
        <a className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900 sm:col-span-2" href="/decisions">Decisions</a>
      </nav>
    </main>
  );
}
