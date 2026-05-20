import { describe, it, expect } from "vitest";
import { deriveEventSlug } from "@/lib/event-author";

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
