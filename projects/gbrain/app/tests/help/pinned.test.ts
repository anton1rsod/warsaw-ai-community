import { describe, it, expect } from "vitest";
import { generatePinnedMessage } from "@/help/pinned";

describe("generatePinnedMessage", () => {
  const opts = {
    gbrainVersion: "0.1.2",
    charterUrl: "https://example.com/charter",
    topicName: "Q&A",
    topicBlurb: "Ask the community."
  };

  it("contains the curated command list", () => {
    const out = generatePinnedMessage(opts);
    expect(out).toContain("/ask");
    expect(out).toContain("/search");
    expect(out).toContain("/help");
  });

  it("interpolates version + charter URL", () => {
    const out = generatePinnedMessage(opts);
    expect(out).toContain("0.1.2");
    expect(out).toContain("https://example.com/charter");
  });

  it("includes topic name and blurb", () => {
    const out = generatePinnedMessage(opts);
    expect(out).toContain("Q&A");
    expect(out).toContain("Ask the community.");
  });
});
