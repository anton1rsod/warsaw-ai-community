import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/retrieval/load", () => ({
  getIndex: () => ({
    entries: [
      { id: "a".repeat(64), source_path: "x.md", source_lines: [1, 5], chunk_hash: "b".repeat(64), embedding: Array.from({ length: 768 }, () => 1), content_preview: "Foo bar.", metadata: { author_handle: "@x", topic: "Q&A", timestamp_iso: "2026-04-26T00:00:00Z", source_link: "https://x.com/x.md#L1-L5" } }
    ],
    manifest: { embedding_model: "gemini-embedding-001" }
  })
}));

vi.mock("@/ai/gateway", () => ({
  embed: vi.fn(async () => Array.from({ length: 768 }, () => 1)),
  answer: vi.fn(async () => ({ text: 'Foo is bar <citation id="1"/>.', usage: { inputTokens: 100, outputTokens: 50 }, model: "gemini-2.5-flash" }))
}));

vi.mock("@/rate-limit", () => ({
  checkRateLimit: () => ({ allowed: true })
}));

const makeInput = (text: string) => {
  const sendMessage = vi.fn(async () => undefined);
  return {
    parsed: {
      raw: { message_id: 1, date: 1, chat: { id: 100, type: "supergroup" }, from: { id: 9, first_name: "X" }, text },
      tags: new Set<string>(), topicId: null, topicClass: "casual" as const,
      authorHandle: "@x", plainText: text, timestamp: new Date()
    },
    config: {} as any,
    bot: { sendMessage } as any
  };
};

describe("/ask", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns reply with citation footer", async () => {
    const { handleAsk } = await import("@/commands/ask");
    const input = makeInput("/ask what is foo?");
    await handleAsk(input);
    expect(input.bot.sendMessage).toHaveBeenCalled();
    const text = input.bot.sendMessage.mock.calls[0]?.[2];
    expect(text).toContain("Foo is bar");
    expect(text).toContain("\\[1\\]");
    expect(text).toContain("@x");
  });
});
