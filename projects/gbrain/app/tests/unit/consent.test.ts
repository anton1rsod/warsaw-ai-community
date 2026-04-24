import { describe, it, expect } from "vitest";
import { evaluate } from "../../src/consent";
import type { ParsedMessage, AuthorPreferences } from "../../src/types";

const NOW = new Date("2026-04-24T12:00:00Z");

function msg(overrides: Partial<ParsedMessage> = {}): ParsedMessage {
  return {
    raw: {
      message_id: 100,
      date: Math.floor(NOW.getTime() / 1000),
      chat: { id: -1001, type: "supergroup" },
      from: { id: 999, first_name: "Alice" }
    },
    tags: new Set<string>(),
    topicId: 1,
    topicClass: "casual",
    authorHandle: "alice",
    plainText: "hello",
    timestamp: NOW,
    ...overrides
  };
}

const noPrefs = (): AuthorPreferences => ({ authorId: 1, optedOut: false, updatedAt: NOW });
const optedOut = (): AuthorPreferences => ({ authorId: 1, optedOut: true, updatedAt: NOW });

describe("consent.evaluate", () => {
  it("denies casual topic + no tags", () => {
    const d = evaluate({ message: msg(), prefs: noPrefs(), taggerIsAuthor: true, now: NOW });
    expect(d.kind).toBe("deny");
  });

  it("allows casual topic + #kb + tagger is author", () => {
    const d = evaluate({
      message: msg({ tags: new Set(["kb"]) }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("allow");
  });

  it("requires confirmation in casual topic + #kb + tagger is not author", () => {
    const d = evaluate({
      message: msg({ tags: new Set(["kb"]) }),
      prefs: noPrefs(), taggerIsAuthor: false, now: NOW
    });
    expect(d.kind).toBe("require_confirm");
    if (d.kind === "require_confirm") {
      expect(d.confirmFrom).toBe(999);
      expect(d.reason).toBeTruthy();
    }
  });

  it("denies #skip in casual topic regardless of other tags", () => {
    const d = evaluate({
      message: msg({ tags: new Set(["kb", "skip"]) }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") expect(d.reason).toMatch(/skip/i);
  });

  it("defers formal topic + no tags for 48h", () => {
    const d = evaluate({
      message: msg({ topicClass: "formal" }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("defer_48h");
    if (d.kind === "defer_48h") {
      expect(d.deferUntil.getTime() - NOW.getTime()).toBe(48 * 60 * 60 * 1000);
      expect(d.reason).toMatch(/formal|pre-consent/i);
    }
  });

  it("allows formal topic + #kb immediately (no defer)", () => {
    const d = evaluate({
      message: msg({ topicClass: "formal", tags: new Set(["kb"]) }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("allow");
    if (d.kind === "allow") expect(d.reason).toBeTruthy();
  });

  it("denies formal topic + #skip hard", () => {
    const d = evaluate({
      message: msg({ topicClass: "formal", tags: new Set(["skip"]) }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("deny");
  });

  it("denies when author is opted out, regardless of topic/tags", () => {
    const d = evaluate({
      message: msg({ topicClass: "formal", tags: new Set(["kb"]) }),
      prefs: optedOut(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") expect(d.reason).toMatch(/opt/i);
  });

  it("treats #archive alias the same as #kb", () => {
    const d = evaluate({
      message: msg({ tags: new Set(["archive"]) }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("allow");
  });

  it("denies when topic is unknown/null", () => {
    const d = evaluate({
      message: msg({ topicId: null }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") expect(d.reason).toMatch(/topic|unknown/i);
  });
});
