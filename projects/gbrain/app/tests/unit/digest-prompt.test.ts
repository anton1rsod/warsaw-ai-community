import { describe, it, expect } from "vitest";
import { buildDigestPrompt } from "../../src/prompts/digest";

describe("buildDigestPrompt", () => {
  it("embeds every message with author + source link, excludes skipped ones", () => {
    const prompt = buildDigestPrompt({
      date: new Date("2026-04-24T09:00:00Z"),
      messages: [
        {
          author: "alice",
          text: "GPT-5 launched",
          source: "https://t.me/c/1/2/3",
          timestamp: new Date("2026-04-24T05:00:00Z")
        },
        {
          author: "bob",
          text: "New Llama paper",
          source: "https://t.me/c/1/2/4",
          timestamp: new Date("2026-04-24T06:00:00Z")
        }
      ]
    });
    expect(prompt).toMatch(/2026-04-24/);
    expect(prompt).toContain("GPT-5 launched");
    expect(prompt).toContain("New Llama paper");
    expect(prompt).toContain("alice");
    expect(prompt).toContain("bob");
    expect(prompt).toMatch(/https:\/\/t\.me\/c\/1\/2\/3/);
    expect(prompt).toMatch(/"why it matters"/);
  });

  it("warns the model when there are no messages", () => {
    const prompt = buildDigestPrompt({
      date: new Date("2026-04-24T09:00:00Z"),
      messages: []
    });
    expect(prompt).toMatch(/no messages/i);
  });
});
