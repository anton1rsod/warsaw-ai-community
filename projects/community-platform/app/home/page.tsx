import { auth } from "@/lib/auth";
import {
  findMemberByHandle,
  listMeetingsFromSnapshot,
  listEventsFromSnapshot,
} from "@/lib/content-snapshot";
import { HomeFeed } from "@/app/components/HomeFeed";
import { YourWeekPane } from "@/app/components/YourWeekPane";
import { computeHomeFeed } from "@/lib/home-feed";

/**
 * /home — anonymous discovery feed + signed-in Your week dashboard pane.
 *
 * Phase A removes the v0.3.1 in-page 5-card section grid; the global
 * <Header> top-nav (Phase A.2.5) is the canonical traversal surface.
 *
 * <HomeHeader> (v0.3.1's auth-aware header) is REMOVED — global <Header>
 * supersedes. Phase A.2.4 deletes app/components/HomeHeader.tsx.
 *
 * Auth-aware → ƒ Dynamic per pattern 8.
 */
function loadFeedData(): ReturnType<typeof computeHomeFeed> {
  return computeHomeFeed({
    meetings: listMeetingsFromSnapshot(),
    events: listEventsFromSnapshot(),
    statusPosts: [],
    contributions: [],
    now: new Date(),
  });
}

function nextRsvpForMember(handle: string): { slug: string; title: string; date: string } | null {
  // Phase A leaves this as a stub returning null — the YourWeekPane
  // empty-state copy is the user-facing surface. v0.4.x or v0.5 wires
  // event_rsvps.json aggregation via a separate lib helper.
  void handle;
  return null;
}

function kudosThisWeekFor(handle: string): number {
  // Same stub pattern — v0.4.x or v0.5 wires the lib/kudos.ts aggregation.
  void handle;
  return 0;
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const session = await auth();
  const handle = session?.githubHandle ?? null;
  const member = handle ? findMemberByHandle(handle) : undefined;
  const signedIn = Boolean(member);

  const feed = loadFeedData();

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-8">
      {signedIn && handle && (
        <YourWeekPane
          nextRsvp={nextRsvpForMember(handle)}
          kudosWeekCount={kudosThisWeekFor(handle)}
        />
      )}
      <HomeFeed feed={feed} />
    </main>
  );
}
