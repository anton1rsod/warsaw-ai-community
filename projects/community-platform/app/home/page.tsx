import { auth } from "@/lib/auth";
import {
  findMemberByHandle,
  listMeetingsFromSnapshot,
  listEventsFromSnapshot,
} from "@/lib/content-snapshot";
import type { MemberWithProfile } from "@/lib/content-snapshot";
import { HomeFeed } from "@/app/components/HomeFeed";
import { YourWeekPane } from "@/app/components/YourWeekPane";
import { computeHomeFeed } from "@/lib/home-feed";
import { computeYourWeek, type YourWeekData } from "@/lib/your-week";
import kudosJson from "@/lib/__generated__/kudos.json";

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
interface KudosEntryShape {
  total: number;
  by_type: { status: number; contribution: number; meeting: number };
  recent: readonly {
    recipient: string;
    item_type: "status" | "contribution" | "meeting";
    item_id: string;
    given_at: string;
  }[];
}

const kudosAggregate = kudosJson as Record<string, KudosEntryShape | undefined>;

function loadFeedData(): ReturnType<typeof computeHomeFeed> {
  return computeHomeFeed({
    meetings: listMeetingsFromSnapshot(),
    events: listEventsFromSnapshot(),
    statusPosts: [],
    contributions: [],
    now: new Date(),
  });
}

function loadYourWeekData(member: MemberWithProfile): YourWeekData {
  const profileData = (member.profile?.data ?? {}) as Record<string, unknown>;
  const rawGoing = profileData.events_going;
  const goingSlugs = Array.isArray(rawGoing)
    ? rawGoing.filter((s): s is string => typeof s === "string")
    : [];
  const kudosRecent = kudosAggregate[member.slug]?.recent ?? [];
  return computeYourWeek({
    goingSlugs,
    events: listEventsFromSnapshot(),
    kudosRecent,
    now: new Date(),
  });
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const session = await auth();
  const handle = session?.githubHandle ?? null;
  const member = handle ? findMemberByHandle(handle) : undefined;
  const yourWeek = member ? loadYourWeekData(member) : null;

  const feed = loadFeedData();

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-8">
      {yourWeek && (
        <YourWeekPane
          nextRsvp={yourWeek.nextRsvp}
          kudosWeekCount={yourWeek.kudosWeekCount}
        />
      )}
      <HomeFeed feed={feed} />
    </main>
  );
}
