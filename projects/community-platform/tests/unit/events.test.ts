import { describe, expect, it } from "vitest";
import {
  EventSchema,
  EventSlugSchema,
  isKnownEventSlug,
  filterOrphanSlugs,
  parseEventFrontmatter,
  type EventSlug,
} from "@/lib/events";

describe("H42: EventSlug branded type", () => {
  it("accepts YYYY-MM-DD-kebab format", () => {
    const valid = EventSlugSchema.parse("2026-06-15-ai-hackathon-kickoff");
    expect(valid).toBe("2026-06-15-ai-hackathon-kickoff");
  });

  it.each([
    ["2026-13-15-bad-month", "month out of range"],
    ["2026-06-32-bad-day", "day out of range"],
    ["20260615-no-dashes", "format"],
    ["2026-06-15-UPPER", "lowercase only"],
    ["2026-06-15-with_underscore", "kebab-case only"],
    ["2026-06-15-", "trailing dash / empty slug part"],
    ["", "empty"],
  ])("rejects %s — %s", (input) => {
    expect(() => EventSlugSchema.parse(input)).toThrow();
  });

  it("accepts multi-segment kebab slug", () => {
    const valid = EventSlugSchema.parse("2026-01-01-event-a-b-c");
    expect(valid).toBe("2026-01-01-event-a-b-c");
  });

  it("accepts slug with digits in the text part", () => {
    const valid = EventSlugSchema.parse("2026-12-31-ai2026-meetup");
    expect(valid).toBe("2026-12-31-ai2026-meetup");
  });
});

describe("H44: parseEventFrontmatter — folder name matches frontmatter slug", () => {
  it("accepts matching folder/slug", () => {
    const fm = parseEventFrontmatter(
      "2026-06-15-ai-hackathon-kickoff",
      { date: "2026-06-15", slug: "2026-06-15-ai-hackathon-kickoff", title: "AI Hackathon Kickoff" },
    );
    expect(fm.slug).toBe("2026-06-15-ai-hackathon-kickoff");
  });

  it("rejects mismatch", () => {
    expect(() =>
      parseEventFrontmatter(
        "2026-06-15-ai-hackathon-kickoff",
        { date: "2026-06-15", slug: "2026-06-15-different-slug", title: "X" },
      ),
    ).toThrow(/folder.*does not match frontmatter slug/);
  });

  it("returns parsed event with defaults applied", () => {
    const fm = parseEventFrontmatter(
      "2026-06-15-ai-hackathon-kickoff",
      { date: "2026-06-15", slug: "2026-06-15-ai-hackathon-kickoff", title: "AI Hackathon Kickoff" },
    );
    expect(fm.status).toBe("scheduled");
    expect(fm.body).toBe("");
  });

  it("accepts optional fields when provided", () => {
    const fm = parseEventFrontmatter(
      "2026-06-15-ai-hackathon-kickoff",
      {
        date: "2026-06-15",
        slug: "2026-06-15-ai-hackathon-kickoff",
        title: "AI Hackathon Kickoff",
        startTime: "18:00",
        durationMinutes: 120,
        location: "Hub:raum Warsaw",
        host: "anton1rsod",
        url: "https://example.com/event",
        status: "cancelled",
        body: "Event details here.",
      },
    );
    expect(fm.startTime).toBe("18:00");
    expect(fm.durationMinutes).toBe(120);
    expect(fm.location).toBe("Hub:raum Warsaw");
    expect(fm.host).toBe("anton1rsod");
    expect(fm.url).toBe("https://example.com/event");
    expect(fm.status).toBe("cancelled");
    expect(fm.body).toBe("Event details here.");
  });

  it("rejects invalid frontmatter (missing title)", () => {
    expect(() =>
      parseEventFrontmatter(
        "2026-06-15-ai-hackathon-kickoff",
        { date: "2026-06-15", slug: "2026-06-15-ai-hackathon-kickoff" },
      ),
    ).toThrow();
  });
});

describe("EventSchema — standalone validation", () => {
  it("parses a minimal valid event", () => {
    const event = EventSchema.parse({
      date: "2026-06-15",
      slug: "2026-06-15-ai-hackathon-kickoff",
      title: "AI Hackathon Kickoff",
    });
    expect(event.title).toBe("AI Hackathon Kickoff");
    expect(event.status).toBe("scheduled");
    expect(event.body).toBe("");
  });

  it("rejects invalid startTime format", () => {
    expect(() =>
      EventSchema.parse({
        date: "2026-06-15",
        slug: "2026-06-15-ai-hackathon-kickoff",
        title: "T",
        startTime: "9:00", // missing leading zero
      }),
    ).toThrow();
  });

  it("rejects invalid url", () => {
    expect(() =>
      EventSchema.parse({
        date: "2026-06-15",
        slug: "2026-06-15-ai-hackathon-kickoff",
        title: "T",
        url: "not-a-url",
      }),
    ).toThrow();
  });

  it("rejects negative durationMinutes", () => {
    expect(() =>
      EventSchema.parse({
        date: "2026-06-15",
        slug: "2026-06-15-ai-hackathon-kickoff",
        title: "T",
        durationMinutes: -10,
      }),
    ).toThrow();
  });

  it("rejects unknown status value", () => {
    expect(() =>
      EventSchema.parse({
        date: "2026-06-15",
        slug: "2026-06-15-ai-hackathon-kickoff",
        title: "T",
        status: "unknown-status",
      }),
    ).toThrow();
  });

  it("accepts 'completed' status", () => {
    const event = EventSchema.parse({
      date: "2026-06-15",
      slug: "2026-06-15-ai-hackathon-kickoff",
      title: "T",
      status: "completed",
    });
    expect(event.status).toBe("completed");
  });
});

describe("H34, H39: orphan-slug filter", () => {
  it("filterOrphanSlugs keeps only slugs present in known set", () => {
    const known = new Set<EventSlug>([
      EventSlugSchema.parse("2026-06-15-ai-hackathon-kickoff"),
    ]);
    const memberSlugs = ["2026-06-15-ai-hackathon-kickoff", "2026-07-04-deleted-event"];
    const filtered = filterOrphanSlugs(memberSlugs, known);
    expect(filtered).toEqual(["2026-06-15-ai-hackathon-kickoff"]);
  });

  it("isKnownEventSlug returns false for unknown slug", () => {
    const known: ReadonlySet<EventSlug> = new Set();
    expect(isKnownEventSlug("2026-06-15-x" as EventSlug, known)).toBe(false);
  });

  it("filterOrphanSlugs returns empty array for empty input", () => {
    const known = new Set<EventSlug>([
      EventSlugSchema.parse("2026-06-15-ai-hackathon-kickoff"),
    ]);
    expect(filterOrphanSlugs([], known)).toEqual([]);
  });

  it("filterOrphanSlugs returns empty array when known set is empty", () => {
    const known = new Set<EventSlug>();
    expect(filterOrphanSlugs(["2026-06-15-ai-hackathon-kickoff"], known)).toEqual([]);
  });

  it("filterOrphanSlugs drops slugs that fail EventSlug format validation", () => {
    const known = new Set<EventSlug>([
      EventSlugSchema.parse("2026-06-15-ai-hackathon-kickoff"),
    ]);
    // "not-a-slug" doesn't match the regex, safeParse fails → dropped
    expect(filterOrphanSlugs(["not-a-slug", "2026-06-15-ai-hackathon-kickoff"], known)).toEqual([
      "2026-06-15-ai-hackathon-kickoff",
    ]);
  });

  it("isKnownEventSlug returns true for a slug in the known set", () => {
    const slug = EventSlugSchema.parse("2026-06-15-ai-hackathon-kickoff");
    const known = new Set<EventSlug>([slug]);
    expect(isKnownEventSlug(slug, known)).toBe(true);
  });
});
