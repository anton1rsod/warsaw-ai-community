import { describe, it, expect } from "vitest";
import { deriveEventSlug } from "@/lib/event-author";

describe("deriveEventSlug — happy path", () => {
  it("kebab-cases title and prepends date", () => {
    const slug = deriveEventSlug("2026-05-28", "AI Community | Meetup #5");
    expect(slug).toBe("2026-05-28-ai-community-meetup-5");
  });
});
