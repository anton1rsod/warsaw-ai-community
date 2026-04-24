// Extra test file beyond plan text — reason: coverage gate (runDigest orchestrator not tested by plan-provided tests)
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ParsedMessage } from "../../src/types";

const mockSummarise = vi.fn();
vi.mock("../../src/ai/index", () => ({ summarise: (...args: unknown[]) => mockSummarise(...args) }));

beforeEach(() => mockSummarise.mockReset());

const BASE_RAW = {
  message_id: 1,
  date: 0,
  chat: { id: -1001234567890, type: "supergroup" },
  message_thread_id: 2,
  from: { id: 99, username: "alice", first_name: "Alice" }
};

function makeMsg(id: number, timestamp: Date): ParsedMessage {
  return {
    raw: { ...BASE_RAW, message_id: id, date: timestamp.getTime() / 1000 },
    tags: new Set(),
    topicId: 1,
    topicClass: "casual",
    authorHandle: "alice",
    plainText: "AI news item",
    timestamp
  };
}

describe("runDigest", () => {
  const NOW = new Date("2026-04-24T12:00:00Z");

  it("returns quiet-day markdown and zero usage when there are no messages", async () => {
    const { runDigest } = await import("../../src/digest/index");
    const result = await runDigest({ messages: [], now: NOW });
    expect(result.itemCount).toBe(0);
    expect(result.usage.inputTokens).toBe(0);
    expect(result.usage.outputTokens).toBe(0);
    expect(result.markdown).toMatch(/quiet day/i);
    expect(mockSummarise).not.toHaveBeenCalled();
  });

  it("calls summarise and wraps the result when there are messages", async () => {
    mockSummarise.mockResolvedValueOnce({
      text: "- **GPT-5** — big deal — why it matters: huge",
      usage: { inputTokens: 200, outputTokens: 50 },
      model: "google/gemini-2.0-flash"
    });
    const { runDigest } = await import("../../src/digest/index");
    const msgs = [makeMsg(1, new Date("2026-04-24T10:00:00Z"))];
    const result = await runDigest({ messages: msgs, now: NOW });
    expect(result.itemCount).toBe(1);
    expect(result.usage.inputTokens).toBe(200);
    expect(result.usage.outputTokens).toBe(50);
    expect(result.markdown).toMatch(/# 🧠 Daily Digest — 2026-04-24/);
    expect(result.markdown).toContain("GPT-5");
    expect(mockSummarise).toHaveBeenCalledOnce();
  });
});
