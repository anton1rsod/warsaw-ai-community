import { describe, it, expect } from "vitest";
import { buildSlug } from "../../src/ingest/slug";

describe("buildSlug", () => {
  it("produces date-prefixed, topic-scoped, truncated kebab slug", () => {
    expect(
      buildSlug({
        timestamp: new Date("2026-04-24T15:30:00Z"),
        topicName: "Questions & Answers",
        plainText: "How do I run Llama 3 locally on a Mac with Apple Silicon?"
      })
    ).toBe("2026-04-24-questions-answers-how-do-i-run-llama-3-locally-on-a");
  });

  it("handles non-ascii by stripping", () => {
    expect(
      buildSlug({
        timestamp: new Date("2026-04-24T00:00:00Z"),
        topicName: "Guides",
        plainText: "Тест документа z polskimi znakami — café"
      })
    ).toMatch(/^2026-04-24-guides-/);
  });

  it("appends message_id when plainText is empty", () => {
    expect(
      buildSlug({
        timestamp: new Date("2026-04-24T00:00:00Z"),
        topicName: "Projects & Repos",
        plainText: "",
        messageId: 12345
      })
    ).toBe("2026-04-24-projects-repos-msg-12345");
  });

  it("falls back to 'untitled' when plainText is empty and no messageId", () => {
    expect(
      buildSlug({
        timestamp: new Date("2026-04-24T00:00:00Z"),
        topicName: "Guides",
        plainText: ""
      })
    ).toBe("2026-04-24-guides-untitled");
  });
});
