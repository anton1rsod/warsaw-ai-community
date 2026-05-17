export type FeedItemType = "meeting" | "event" | "status" | "contribution";

export interface FeedItem {
  type: FeedItemType;
  slug: string;
  title: string;
  href: string;
  date: string;
  author?: string;
  excerpt?: string;
}

interface MeetingLike { date: string; slug: string; title: string; body: string }
interface EventLike { date: string; slug: string; title: string; body: string }
interface StatusLike { date: string; slug: string; title: string; body: string; author: string }
interface ContributionLike { date: string; slug: string; title: string; author: string }

export interface HomeFeedInput {
  meetings: readonly MeetingLike[];
  events: readonly EventLike[];
  statusPosts: readonly StatusLike[];
  contributions: readonly ContributionLike[];
  now: Date;
}

export interface HomeFeedData {
  thisWeek: FeedItem[];
  recent: FeedItem[];
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * ONE_DAY_MS;
const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;
const RECENT_CAP = 10;

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

function meetingToFeedItem(m: MeetingLike): FeedItem {
  return {
    type: "meeting",
    slug: m.slug,
    title: m.title,
    href: `/meetings/${m.slug}`,
    date: m.date,
    excerpt: m.body.split("\n").find((l) => l.trim()) ?? undefined,
  };
}

function eventToFeedItem(e: EventLike): FeedItem {
  return {
    type: "event",
    slug: e.slug,
    title: e.title,
    href: `/events/${e.slug}`,
    date: e.date,
    excerpt: e.body.split("\n").find((l) => l.trim()) ?? undefined,
  };
}

function statusToFeedItem(s: StatusLike): FeedItem {
  return {
    type: "status",
    slug: s.slug,
    title: s.title,
    href: `/this-week`,
    date: s.date,
    author: s.author,
    excerpt: s.body.split("\n").find((l) => l.trim()) ?? undefined,
  };
}

function contributionToFeedItem(c: ContributionLike): FeedItem {
  const projectSlug = c.slug.split(":")[0] ?? c.slug;
  return {
    type: "contribution",
    slug: c.slug,
    title: c.title,
    href: `/projects/${projectSlug}`,
    date: c.date,
    author: c.author,
  };
}

export function computeHomeFeed(input: HomeFeedInput): HomeFeedData {
  const { mondayISO, sundayISO } = weekBounds(input.now);
  const nowTs = input.now.getTime();
  const fourteenDaysOutISO = new Date(nowTs + FOURTEEN_DAYS_MS).toISOString().slice(0, 10);
  const thirtyDaysAgoISO = new Date(nowTs - THIRTY_DAYS_MS).toISOString().slice(0, 10);

  const thisWeek: FeedItem[] = [];
  const recent: FeedItem[] = [];

  for (const m of input.meetings) {
    if (m.date >= mondayISO && m.date <= sundayISO) thisWeek.push(meetingToFeedItem(m));
    else if (m.date >= thirtyDaysAgoISO && m.date < mondayISO) recent.push(meetingToFeedItem(m));
  }
  for (const e of input.events) {
    const nowISO = input.now.toISOString().slice(0, 10);
    if (e.date >= nowISO && e.date <= fourteenDaysOutISO) thisWeek.push(eventToFeedItem(e));
    else if (e.date >= thirtyDaysAgoISO && e.date < mondayISO) recent.push(eventToFeedItem(e));
  }
  for (const s of input.statusPosts) {
    if (s.date >= mondayISO && s.date <= sundayISO) thisWeek.push(statusToFeedItem(s));
    else if (s.date >= thirtyDaysAgoISO && s.date < mondayISO) recent.push(statusToFeedItem(s));
  }
  for (const c of input.contributions) {
    if (c.date >= mondayISO && c.date <= sundayISO) thisWeek.push(contributionToFeedItem(c));
    else if (c.date >= thirtyDaysAgoISO && c.date < mondayISO) recent.push(contributionToFeedItem(c));
  }

  recent.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { thisWeek, recent: recent.slice(0, RECENT_CAP) };
}
