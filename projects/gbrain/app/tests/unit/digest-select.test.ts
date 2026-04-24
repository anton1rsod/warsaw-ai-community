// Extra test file beyond plan text — reason: coverage gate (select.ts not tested by plan-provided tests)
import { describe, it, expect } from "vitest";
import { selectRecent } from "../../src/digest/select";
import type { ParsedMessage } from "../../src/types";

const BASE_RAW = {
  message_id: 1,
  date: 0,
  chat: { id: -1001234567890, type: "supergroup" },
  message_thread_id: 2,
  from: { id: 99, username: "alice", first_name: "Alice" }
};

function makeMsg(
  id: number,
  timestamp: Date,
  tags: string[] = [],
  text = "some news"
): ParsedMessage {
  return {
    raw: { ...BASE_RAW, message_id: id, date: timestamp.getTime() / 1000 },
    tags: new Set(tags),
    topicId: 1,
    topicClass: "casual",
    authorHandle: "alice",
    plainText: text,
    timestamp
  };
}

describe("selectRecent", () => {
  const NOW = new Date("2026-04-24T12:00:00Z");

  it("filters out messages tagged #skip", () => {
    const msgs = [
      makeMsg(1, new Date("2026-04-24T10:00:00Z"), []),
      makeMsg(2, new Date("2026-04-24T10:00:00Z"), ["skip"])
    ];
    const result = selectRecent(msgs, NOW);
    expect(result).toHaveLength(1);
    expect(result.at(0)?.source).toContain("/1");
  });

  it("filters out messages older than the cutoff window", () => {
    const msgs = [
      makeMsg(1, new Date("2026-04-23T11:00:00Z"), []), // 25h ago — outside
      makeMsg(2, new Date("2026-04-23T13:00:00Z"), [])  // 23h ago — inside
    ];
    const result = selectRecent(msgs, NOW, 24);
    expect(result).toHaveLength(1);
    expect(result.at(0)?.source).toContain("/2");
  });

  it("respects the limit and sorts by timestamp ascending", () => {
    const msgs = [
      makeMsg(3, new Date("2026-04-24T11:00:00Z"), []),
      makeMsg(1, new Date("2026-04-24T09:00:00Z"), []),
      makeMsg(2, new Date("2026-04-24T10:00:00Z"), [])
    ];
    const result = selectRecent(msgs, NOW, 24, 2);
    expect(result).toHaveLength(2);
    // sorted ascending: ids 1 then 2
    expect(result.at(0)?.source).toContain("/1");
    expect(result.at(1)?.source).toContain("/2");
  });

  it("builds a correct Telegram source URL stripping the 100 prefix", () => {
    const msgs = [makeMsg(42, new Date("2026-04-24T10:00:00Z"))];
    const result = selectRecent(msgs, NOW);
    // chat.id = -1001234567890 → abs → 1001234567890 → replace /^100/ → 1234567890
    expect(result.at(0)?.source).toBe("https://t.me/c/1234567890/2/42");
  });
});
