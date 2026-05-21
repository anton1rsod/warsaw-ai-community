/**
 * /home YourWeekPane data layer (v0.4.1 Option B / O9 wire-up).
 *
 * Pure compute function — takes injected snapshot data + `now`, returns
 * the two values the YourWeekPane component expects (nextRsvp + kudosWeekCount).
 * I/O glue lives in app/home/page.tsx, matching the home-feed.ts pattern.
 *
 * Data-source notes:
 *   - goingSlugs are read from the member's OWN profile frontmatter
 *     (events_going), not the public event-rosters.json aggregate — the
 *     aggregate strips members_only-visibility RSVPs into hiddenCount,
 *     so a private-visibility member's own Going list would be invisible
 *     to themselves if we sourced from the aggregate.
 *   - kudosRecent comes from kudos.json[member.slug].recent, which is
 *     capped to the 5 most-recent kudos. A member receiving 6+ kudos in
 *     a single ISO week is silently undercounted. Acceptable while the
 *     community is small (2-3 active); revisit if growth makes this
 *     visible.
 */

interface EventLike {
  date: string;
  slug: string;
  title: string;
  startTime?: string;
  location?: string;
}

interface KudosRecent {
  given_at: string;
}

export interface NextRsvp {
  slug: string;
  title: string;
  date: string;
  startTime?: string;
  location?: string;
}

export interface YourWeekInput {
  goingSlugs: readonly string[];
  events: readonly EventLike[];
  kudosRecent: readonly KudosRecent[];
  now: Date;
}

export interface YourWeekData {
  nextRsvp: NextRsvp | null;
  kudosWeekCount: number;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function weekBounds(now: Date): { mondayISO: string; sundayISO: string } {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayOfWeek = d.getUTCDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(d.getTime() - daysSinceMonday * ONE_DAY_MS);
  const sunday = new Date(monday.getTime() + 6 * ONE_DAY_MS);
  return {
    mondayISO: monday.toISOString().slice(0, 10),
    sundayISO: sunday.toISOString().slice(0, 10),
  };
}

function findNextRsvp(input: YourWeekInput): NextRsvp | null {
  if (input.goingSlugs.length === 0) return null;
  const goingSet = new Set(input.goingSlugs);
  const todayISO = input.now.toISOString().slice(0, 10);
  const upcoming = input.events
    .filter((e) => goingSet.has(e.slug) && e.date >= todayISO)
    .sort((a, b) => a.date.localeCompare(b.date));
  const first = upcoming[0];
  if (!first) return null;
  return {
    slug: first.slug,
    title: first.title,
    date: first.date,
    startTime: first.startTime,
    location: first.location,
  };
}

function countKudosThisWeek(input: YourWeekInput): number {
  const { mondayISO, sundayISO } = weekBounds(input.now);
  return input.kudosRecent.filter((t) => {
    const givenISO = t.given_at.slice(0, 10);
    return givenISO >= mondayISO && givenISO <= sundayISO;
  }).length;
}

export function computeYourWeek(input: YourWeekInput): YourWeekData {
  return {
    nextRsvp: findNextRsvp(input),
    kudosWeekCount: countKudosThisWeek(input),
  };
}
