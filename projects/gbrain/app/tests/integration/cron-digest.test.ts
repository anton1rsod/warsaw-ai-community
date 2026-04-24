import { describe, it, expect, vi } from "vitest";
import { runDigest } from "../../src/digest/index";
import type { ParsedMessage } from "../../src/types";

vi.mock("ai", () => ({
  generateText: vi.fn(async () => ({
    text: "- **DeepSeek V4 launched** — matches Claude Opus 4.5\n  https://deepseek.ai/v4\n  why it matters: open-source frontier model",
    usage: { inputTokens: 80, outputTokens: 40 }
  }))
}));

const NOW = new Date("2026-04-24T09:00:00Z");

function mkMsg(text: string, hoursAgo: number): ParsedMessage {
  return {
    raw: {
      message_id: 1 + hoursAgo,
      date: (NOW.getTime() - hoursAgo * 3600 * 1000) / 1000,
      chat: { id: -1001234567890, type: "supergroup" },
      message_thread_id: 6,
      from: { id: 500, username: "alice", first_name: "Alice" },
      text
    },
    tags: new Set(),
    topicId: 6,
    topicClass: "formal",
    authorHandle: "alice",
    plainText: text,
    timestamp: new Date(NOW.getTime() - hoursAgo * 3600 * 1000)
  };
}

describe("runDigest", () => {
  it("renders an empty-day digest when no messages are in the 24h window", async () => {
    const result = await runDigest({ messages: [], now: NOW });
    expect(result.itemCount).toBe(0);
    expect(result.markdown).toMatch(/quiet day/i);
  });

  it("renders a populated digest when messages exist", async () => {
    const result = await runDigest({
      messages: [mkMsg("DeepSeek V4 Pro launched", 2), mkMsg("old news", 48)],
      now: NOW
    });
    expect(result.itemCount).toBe(1); // 48h-old item excluded
    expect(result.markdown).toMatch(/DeepSeek V4/);
    expect(result.markdown).toMatch(/# 🧠 Daily Digest/);
  });
});
