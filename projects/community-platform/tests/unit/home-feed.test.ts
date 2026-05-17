import { describe, expect, it } from "vitest";
import { computeHomeFeed, type HomeFeedInput } from "@/lib/home-feed";

const baseInput: HomeFeedInput = {
  meetings: [
    { date: "2026-05-19", slug: "2026-05-19", title: "This-Week Meeting", body: "Body excerpt" },
    { date: "2026-05-05", slug: "2026-05-05", title: "Recent Meeting", body: "" },
    { date: "2026-03-01", slug: "2026-03-01", title: "Old Meeting", body: "" },
  ],
  events: [
    { date: "2026-05-25", slug: "2026-05-25-near-future", title: "Near event", body: "" },
    { date: "2026-06-15", slug: "2026-06-15-hackathon", title: "Future event (>14d)", body: "" },
  ],
  statusPosts: [
    { date: "2026-05-12", slug: "2026-W19/anton1rsod", title: "@anton1rsod week 19", body: "Excerpt", author: "anton1rsod" },
  ],
  contributions: [
    { date: "2026-05-10", slug: "community-platform:anton-safronov", title: "anton1rsod → community-platform", author: "anton1rsod" },
  ],
  now: new Date("2026-05-19T12:00:00Z"),
};

describe("H38: home-feed bucket boundaries", () => {
  it("thisWeek = current Mon-Sun week (Europe/Warsaw) for meetings", () => {
    const feed = computeHomeFeed(baseInput);
    const thisWeekTypes = feed.thisWeek.map((i) => i.type);
    expect(thisWeekTypes).toContain("meeting");
    expect(feed.thisWeek.some((i) => i.slug === "2026-05-19")).toBe(true);
    expect(feed.thisWeek.some((i) => i.slug === "2026-05-05")).toBe(false);
  });

  it("thisWeek includes events in next 14 days from now", () => {
    const feed = computeHomeFeed(baseInput);
    expect(feed.thisWeek.some((i) => i.slug === "2026-05-25-near-future")).toBe(true);
    expect(feed.thisWeek.some((i) => i.slug === "2026-06-15-hackathon")).toBe(false);
  });

  it("recent = last 30 days EXCLUDING thisWeek (D3)", () => {
    const feed = computeHomeFeed(baseInput);
    expect(feed.recent.some((i) => i.slug === "2026-05-05")).toBe(true);
    expect(feed.recent.some((i) => i.slug === "2026-05-19")).toBe(false);
    expect(feed.recent.some((i) => i.slug === "2026-03-01")).toBe(false);
  });

  it("recent sorted desc by date, capped at 10 items", () => {
    const many: HomeFeedInput = {
      ...baseInput,
      statusPosts: Array.from({ length: 15 }, (_, i) => ({
        date: `2026-05-${String(10 - (i % 5)).padStart(2, "0")}`,
        slug: `status-${i}`,
        title: `Post ${i}`,
        body: "",
        author: "x",
      })),
    };
    const feed = computeHomeFeed(many);
    expect(feed.recent.length).toBeLessThanOrEqual(10);
    for (let i = 0; i < feed.recent.length - 1; i++) {
      const a = feed.recent[i];
      const b = feed.recent[i + 1];
      if (a && b) expect(a.date >= b.date).toBe(true);
    }
  });
});

describe("H33: empty states", () => {
  it("empty thisWeek + empty recent → empty arrays (caller renders empty-state copy)", () => {
    const feed = computeHomeFeed({ meetings: [], events: [], statusPosts: [], contributions: [], now: new Date() });
    expect(feed.thisWeek).toEqual([]);
    expect(feed.recent).toEqual([]);
  });
});

describe("branch coverage: contribution href", () => {
  it("contribution slug with colon → href uses projectSlug (left of colon)", () => {
    const feed = computeHomeFeed(baseInput);
    const contrib = feed.recent.find((i) => i.type === "contribution");
    expect(contrib).toBeDefined();
    expect(contrib?.href).toBe("/projects/community-platform");
  });

  it("contribution slug without colon → href uses full slug", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      contributions: [
        { date: "2026-05-10", slug: "some-project", title: "No colon slug", author: "user1" },
      ],
    };
    const feed = computeHomeFeed(input);
    const contrib = feed.recent.find((i) => i.type === "contribution");
    expect(contrib).toBeDefined();
    expect(contrib?.href).toBe("/projects/some-project");
  });
});

describe("branch coverage: excerpt fallback", () => {
  it("non-empty body → excerpt is first non-empty line", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [
        { date: "2026-05-19", slug: "2026-05-19", title: "Meeting with body", body: "First line\nSecond line" },
      ],
      events: [],
      statusPosts: [],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    const item = feed.thisWeek.find((i) => i.type === "meeting");
    expect(item?.excerpt).toBe("First line");
  });

  it("body with leading blank lines → excerpt skips to first non-empty line", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [
        { date: "2026-05-19", slug: "2026-05-19", title: "Meeting", body: "\n\nActual content" },
      ],
      events: [],
      statusPosts: [],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    const item = feed.thisWeek.find((i) => i.type === "meeting");
    expect(item?.excerpt).toBe("Actual content");
  });

  it("empty body → excerpt is undefined (not empty string)", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [
        { date: "2026-05-19", slug: "2026-05-19", title: "Meeting no body", body: "" },
      ],
      events: [],
      statusPosts: [],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    const item = feed.thisWeek.find((i) => i.type === "meeting");
    expect(item?.excerpt).toBeUndefined();
  });

  it("status post with non-empty body → excerpt populated", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [],
      statusPosts: [
        { date: "2026-05-19", slug: "status-1", title: "Status", body: "Status excerpt text", author: "alice" },
      ],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    const item = feed.thisWeek.find((i) => i.type === "status");
    expect(item?.excerpt).toBe("Status excerpt text");
  });

  it("status post with empty body → excerpt is undefined", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [],
      statusPosts: [
        { date: "2026-05-19", slug: "status-2", title: "Status empty", body: "", author: "bob" },
      ],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    const item = feed.thisWeek.find((i) => i.type === "status");
    expect(item?.excerpt).toBeUndefined();
  });

  it("event with non-empty body → excerpt populated", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [
        { date: "2026-05-25", slug: "event-1", title: "Event with body", body: "Event excerpt" },
      ],
      statusPosts: [],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    const item = feed.thisWeek.find((i) => i.type === "event");
    expect(item?.excerpt).toBe("Event excerpt");
  });

  it("event with empty body → excerpt is undefined", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [
        { date: "2026-05-25", slug: "event-2", title: "Event no body", body: "" },
      ],
      statusPosts: [],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    const item = feed.thisWeek.find((i) => i.type === "event");
    expect(item?.excerpt).toBeUndefined();
  });
});

describe("branch coverage: event in recent bucket", () => {
  it("past event within 30 days but before thisWeek → lands in recent", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [
        // date before Monday 2026-05-18 but within 30 days of 2026-05-19
        { date: "2026-05-10", slug: "past-event", title: "Past event", body: "" },
      ],
      statusPosts: [],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    expect(feed.recent.some((i) => i.slug === "past-event")).toBe(true);
    expect(feed.thisWeek.some((i) => i.slug === "past-event")).toBe(false);
  });
});

describe("branch coverage: statusPost in recent bucket", () => {
  it("status post within 30 days but before thisWeek → lands in recent", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [],
      statusPosts: [
        { date: "2026-05-12", slug: "status-recent", title: "Recent status", body: "body", author: "alice" },
      ],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    expect(feed.recent.some((i) => i.slug === "status-recent")).toBe(true);
    expect(feed.thisWeek.some((i) => i.slug === "status-recent")).toBe(false);
  });
});

describe("branch coverage: contribution in recent bucket", () => {
  it("contribution within 30 days but before thisWeek → lands in recent", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [],
      statusPosts: [],
      contributions: [
        { date: "2026-05-10", slug: "proj:user", title: "Contribution", author: "alice" },
      ],
    };
    const feed = computeHomeFeed(input);
    expect(feed.recent.some((i) => i.slug === "proj:user")).toBe(true);
    expect(feed.thisWeek.some((i) => i.slug === "proj:user")).toBe(false);
  });
});

describe("branch coverage: thisWeek contributions and statuses", () => {
  it("contribution dated in thisWeek → lands in thisWeek", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [],
      statusPosts: [],
      contributions: [
        { date: "2026-05-19", slug: "proj:user", title: "This-week contribution", author: "alice" },
      ],
    };
    const feed = computeHomeFeed(input);
    expect(feed.thisWeek.some((i) => i.slug === "proj:user")).toBe(true);
  });

  it("status post dated in thisWeek → lands in thisWeek", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [],
      statusPosts: [
        { date: "2026-05-19", slug: "status-tw", title: "This-week status", body: "", author: "alice" },
      ],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    expect(feed.thisWeek.some((i) => i.slug === "status-tw")).toBe(true);
  });
});

describe("feed item shapes", () => {
  it("meeting FeedItem has correct href shape", () => {
    const feed = computeHomeFeed(baseInput);
    const m = feed.thisWeek.find((i) => i.type === "meeting");
    expect(m?.href).toBe("/meetings/2026-05-19");
  });

  it("event FeedItem has correct href shape", () => {
    const feed = computeHomeFeed(baseInput);
    const e = feed.thisWeek.find((i) => i.type === "event");
    expect(e?.href).toBe("/events/2026-05-25-near-future");
  });

  it("status FeedItem href is /this-week", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    const s = feed.recent.find((i) => i.type === "status");
    expect(s?.href).toBe("/this-week");
  });

  it("status FeedItem includes author", () => {
    const input: HomeFeedInput = {
      ...baseInput,
      meetings: [],
      events: [],
      contributions: [],
    };
    const feed = computeHomeFeed(input);
    const s = feed.recent.find((i) => i.type === "status");
    expect(s?.author).toBe("anton1rsod");
  });

  it("contribution FeedItem includes author", () => {
    const feed = computeHomeFeed(baseInput);
    const c = feed.recent.find((i) => i.type === "contribution");
    expect(c?.author).toBe("anton1rsod");
  });
});
