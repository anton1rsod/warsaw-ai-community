import { describe, it, expect } from "vitest";
import { toMarkdown } from "../../src/ingest/index";
import type { ParsedMessage } from "../../src/types";

const NOW = new Date("2026-04-24T12:34:56Z");

function msg(body: string): ParsedMessage {
  return {
    raw: {
      message_id: 42,
      date: NOW.getTime() / 1000,
      chat: { id: -1001234567890, type: "supergroup" },
      message_thread_id: 1,
      from: { id: 99, username: "alice", first_name: "Alice" },
      text: body
    },
    tags: new Set(["kb"]),
    topicId: 1,
    topicClass: "casual",
    authorHandle: "alice",
    plainText: body,
    timestamp: NOW
  };
}

describe("ingest.toMarkdown", () => {
  it("produces deterministic frontmatter + body", () => {
    const md = toMarkdown({
      message: msg("Hello **world**"),
      topicName: "Questions & Answers",
      chatIdForLink: -1001234567890
    });
    expect(md).toContain("---\n");
    expect(md).toMatch(/topic: Questions & Answers/);
    expect(md).toMatch(/author_handle: alice/);
    expect(md).toMatch(/timestamp: 2026-04-24T12:34:56\.000Z/);
    expect(md).toMatch(/source: https:\/\/t\.me\/c\/1234567890\/1\/42/);
    expect(md).toMatch(/tags:\s*\n\s*- kb/);
    expect(md).toMatch(/\n\nHello \*\*world\*\*\n/);
  });

  it("strips channel prefix from chat id in source link", () => {
    const md = toMarkdown({
      message: msg("x"),
      topicName: "Guides",
      chatIdForLink: -1009876543210
    });
    expect(md).toMatch(/https:\/\/t\.me\/c\/9876543210\//);
  });

  it("keeps chat id unchanged when it doesn't start with 100, and omits thread segment when message_thread_id is absent", () => {
    const parsed: ParsedMessage = {
      raw: {
        message_id: 7,
        date: NOW.getTime() / 1000,
        chat: { id: -555, type: "group" },
        from: { id: 99, first_name: "Alice" },
        text: "no thread"
      },
      tags: new Set(),
      topicId: 1,
      topicClass: "casual",
      authorHandle: "alice",
      plainText: "no thread",
      timestamp: NOW
    };
    const md = toMarkdown({
      message: parsed,
      topicName: "General",
      chatIdForLink: -555
    });
    expect(md).toMatch(/source: https:\/\/t\.me\/c\/555\/7$/m);
  });

  it("emits frontmatter fields in the spec-mandated order", () => {
    const md = toMarkdown({
      message: msg("x"),
      topicName: "Guides",
      chatIdForLink: -1001234567890
    });
    expect(md).toMatch(
      /^---\ntopic: .+\ntopic_id: .*\nauthor_handle: .+\nauthor_id: \d+\ntimestamp: .+\nsource: .+\ntags:(?:\n {2}- .+)*\ntopic_class: (?:formal|casual)\n---\n/
    );
  });
});
