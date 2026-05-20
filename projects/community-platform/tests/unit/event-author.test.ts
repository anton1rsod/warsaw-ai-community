import { describe, it, expect } from "vitest";
import matter from "gray-matter";
import {
  parseEventFrontmatter,
  normalizeEventFrontmatter,
} from "@/lib/events";
import {
  composeEventReadme,
  deriveEventSlug,
} from "@/lib/event-author";

describe("deriveEventSlug — happy path", () => {
  it("kebab-cases title and prepends date", () => {
    const slug = deriveEventSlug("2026-05-28", "AI Community | Meetup #5");
    expect(slug).toBe("2026-05-28-ai-community-meetup-5");
  });
});

describe("deriveEventSlug — edge cases", () => {
  it("strips diacritics via NFKD (Polish characters)", () => {
    expect(deriveEventSlug("2026-06-01", "Łódź meetup")).toBe(
      "2026-06-01-odz-meetup",
    );
  });

  it("collapses runs of whitespace", () => {
    expect(deriveEventSlug("2026-06-01", "AI    summit   2026")).toBe(
      "2026-06-01-ai-summit-2026",
    );
  });

  it("strips leading + trailing dashes", () => {
    expect(deriveEventSlug("2026-06-01", "— hello —")).toBe(
      "2026-06-01-hello",
    );
  });

  it("caps title segment at 60 chars", () => {
    const longTitle = "a".repeat(120);
    const slug = deriveEventSlug("2026-06-01", longTitle);
    expect(slug).toBe(`2026-06-01-${"a".repeat(60)}`);
  });

  it("drops punctuation but keeps alphanumeric + hyphen", () => {
    expect(deriveEventSlug("2026-06-01", "Meetup #5: RAG! (live)")).toBe(
      "2026-06-01-meetup-5-rag-live",
    );
  });

  it("returns degenerate `<date>-` when title yields empty slug", () => {
    expect(deriveEventSlug("2026-06-01", "—")).toBe("2026-06-01-");
  });
});

describe("composeEventReadme — happy path", () => {
  it("emits YAML that round-trips through parseEventFrontmatter", () => {
    const out = composeEventReadme({
      date: "2026-05-28",
      slug: "2026-05-28-test",
      title: "Test Event",
      startTime: "19:00",
      durationMinutes: 120,
      location: "Grzybowska 85a, Warsaw",
      host: "anton1rsod",
      url: "https://example.com/event",
      status: "scheduled",
      body: "Body content here.",
    });

    const { data, content } = matter(out);
    const event = parseEventFrontmatter("2026-05-28-test", {
      ...normalizeEventFrontmatter(data as Record<string, unknown>),
      body: content,
    });

    expect(event.date).toBe("2026-05-28");
    expect(event.slug).toBe("2026-05-28-test");
    expect(event.title).toBe("Test Event");
    expect(event.startTime).toBe("19:00");
    expect(event.durationMinutes).toBe(120);
    expect(event.location).toBe("Grzybowska 85a, Warsaw");
    expect(event.host).toBe("anton1rsod");
    expect(event.url).toBe("https://example.com/event");
    expect(event.status).toBe("scheduled");
    expect(event.body.trim()).toBe("Body content here.");
  });
});

describe("composeEventReadme — optional fields", () => {
  it("omits optional frontmatter keys when input fields are undefined", () => {
    const out = composeEventReadme({
      date: "2026-05-28",
      slug: "2026-05-28-test",
      title: "Bare Event",
      status: "scheduled",
      body: "",
    });

    expect(out).toMatch(/^date: 2026-05-28$/m);
    expect(out).toMatch(/^slug: "2026-05-28-test"$/m);
    expect(out).toMatch(/^title: "Bare Event"$/m);
    expect(out).toMatch(/^status: "scheduled"$/m);

    expect(out).not.toMatch(/^start_time:/m);
    expect(out).not.toMatch(/^duration_minutes:/m);
    expect(out).not.toMatch(/^location:/m);
    expect(out).not.toMatch(/^host:/m);
    expect(out).not.toMatch(/^url:/m);
  });
});

describe("composeEventReadme — YAML escape", () => {
  it("escapes embedded double quotes in title", () => {
    const out = composeEventReadme({
      date: "2026-05-28",
      slug: "2026-05-28-test",
      title: 'A "quoted" event',
      status: "scheduled",
      body: "",
    });
    const { data } = matter(out);
    expect((data as { title: string }).title).toBe('A "quoted" event');
  });

  it("escapes backslashes in location", () => {
    const out = composeEventReadme({
      date: "2026-05-28",
      slug: "2026-05-28-test",
      title: "Event",
      location: "C:\\path\\place",
      status: "scheduled",
      body: "",
    });
    const { data } = matter(out);
    expect((data as { location: string }).location).toBe("C:\\path\\place");
  });
});

describe("H80: body cannot inject second frontmatter block", () => {
  it("gray-matter ignores second frontmatter block in body (parse-semantics defense)", () => {
    const out = composeEventReadme({
      date: "2026-05-28",
      slug: "2026-05-28-test",
      title: "Event",
      status: "scheduled",
      body: "---\nmalicious: true\n---\nLegit body.",
    });

    const { data, content } = matter(out);
    expect((data as Record<string, unknown>).malicious).toBeUndefined();
    expect((data as { title: string }).title).toBe("Event");
    expect(content).toContain("malicious: true");
    expect(content).toContain("Legit body.");
  });
});

describe("composeEventReadme — empty body", () => {
  it("emits parseable README with empty body", () => {
    const out = composeEventReadme({
      date: "2026-05-28",
      slug: "2026-05-28-test",
      title: "Event",
      status: "scheduled",
      body: "",
    });
    const { data, content } = matter(out);
    expect((data as { title: string }).title).toBe("Event");
    // gray-matter preserves the trailing blank line after the closing `---`
    // as `"\n"`; we assert the content is structurally empty (trim-equivalent).
    expect(content.trim()).toBe("");
  });
});
