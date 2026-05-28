import { describe, expect, it, vi, beforeEach } from "vitest";
import { notifyTelegram, composeTelegramMessage } from "@/lib/telegram-notify";

describe("composeTelegramMessage", () => {
  it("composes a 200-char-or-less echo with platform URL", () => {
    const out = composeTelegramMessage({
      handle: "anton1rsod",
      week: "2026-W22",
      body: "Shipped v0.9.1.1 + drafted the cold-start brainstorm.",
      url: "https://warsaw-ai-community-platform.vercel.app/this-week",
    });
    expect(out).toMatch(/📝/);
    expect(out).toMatch(/@anton1rsod/);
    expect(out).toMatch(/2026-W22/);
    expect(out).toMatch(/Shipped v0.9.1.1/);
    expect(out).toMatch(/warsaw-ai-community-platform/);
  });

  it("truncates bodies > 200 chars with an ellipsis", () => {
    const longBody = "x".repeat(250);
    const out = composeTelegramMessage({
      handle: "u",
      week: "2026-W22",
      body: longBody,
      url: "https://x.test/",
    });
    expect(out).toMatch(/x{200}…/);
    expect(out).not.toMatch(/x{201}/);
  });
});

describe("notifyTelegram (H119 — fire-and-forget; never throws)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns { ok: true } on a 200 response", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    const out = await notifyTelegram({
      handle: "u",
      week: "2026-W22",
      body: "hi",
      url: "https://x.test/",
      botToken: "12345:fake",
      chatId: "-100",
      topicId: undefined,
    });
    expect(out).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("returns { ok: false, reason } on a non-2xx response — does NOT throw", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("rate limited", { status: 429 }),
    );
    const out = await notifyTelegram({
      handle: "u",
      week: "2026-W22",
      body: "hi",
      url: "https://x.test/",
      botToken: "12345:fake",
      chatId: "-100",
      topicId: undefined,
    });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toMatch(/429/);
  });

  it("returns { ok: false, reason } on network failure — does NOT throw", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNRESET"));
    const out = await notifyTelegram({
      handle: "u",
      week: "2026-W22",
      body: "hi",
      url: "https://x.test/",
      botToken: "12345:fake",
      chatId: "-100",
      topicId: undefined,
    });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toMatch(/ECONNRESET/);
  });

  it("returns { ok: false, reason: 'unconfigured' } when botToken is missing", async () => {
    const out = await notifyTelegram({
      handle: "u",
      week: "2026-W22",
      body: "hi",
      url: "https://x.test/",
      botToken: undefined,
      chatId: undefined,
      topicId: undefined,
    });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe("unconfigured");
  });

  it("passes message_thread_id when topicId is provided", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    await notifyTelegram({
      handle: "u",
      week: "2026-W22",
      body: "hi",
      url: "https://x.test/",
      botToken: "12345:fake",
      chatId: "-100",
      topicId: "42",
    });
    const call = fetchSpy.mock.calls[0];
    if (!call) throw new Error("expected one fetch call");
    const init = call[1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.message_thread_id).toBe(42);
  });
});
