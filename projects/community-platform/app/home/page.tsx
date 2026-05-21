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
import { formatTimeUntil } from "@/lib/time-until";
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
 * v0.6 Phase 3.2: explicit `force-dynamic` so the auth-aware YourWeekPane
 * renders fresh per request (matches the v0.4.8 /events/[slug] flip). The
 * page is anon-allowed per ADR-0012 discovery posture — signed-out users
 * see only HomeFeed without the YourWeekPane hero.
 */
export const dynamic = "force-dynamic";

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

function loadYourWeekData(
  member: MemberWithProfile,
  now: Date,
): YourWeekData {
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
    now,
  });
}

function firstNameFromMember(
  member: MemberWithProfile,
  fallbackHandle: string,
): string {
  const source = member.name.trim() || fallbackHandle;
  const head = source.split(/\s+/)[0];
  return head ?? fallbackHandle;
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const session = await auth();
  const handle = session?.githubHandle ?? null;
  const member = handle ? findMemberByHandle(handle) : undefined;
  const now = new Date();
  const yourWeek = member ? loadYourWeekData(member, now) : null;
  const firstName = member ? firstNameFromMember(member, handle ?? "") : "";
  const timeUntil =
    yourWeek?.nextRsvp != null
      ? formatTimeUntil(yourWeek.nextRsvp.date, yourWeek.nextRsvp.startTime, now)
      : undefined;

  const feed = loadFeedData();

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-8">
      {yourWeek && member && (
        <YourWeekPane
          firstName={firstName}
          nextRsvp={yourWeek.nextRsvp}
          timeUntil={timeUntil}
          kudosWeekCount={yourWeek.kudosWeekCount}
          now={now}
        />
      )}
      <HomeFeed feed={feed} />
    </main>
  );
}
