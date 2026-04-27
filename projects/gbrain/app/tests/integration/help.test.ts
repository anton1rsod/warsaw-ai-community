import { describe, it, expect, vi } from "vitest";
import { handleHelp } from "@/commands/help";

const makeInput = (text: string) => {
  const sendMessage = vi.fn(async () => undefined);
  return {
    parsed: {
      raw: { message_id: 1, date: 1, chat: { id: 100, type: "supergroup" }, from: { id: 9, first_name: "X" }, text },
      tags: new Set<string>(),
      topicId: null,
      topicClass: "casual" as const,
      authorHandle: "@x",
      plainText: text,
      timestamp: new Date()
    },
    config: { telegram: { token: "t", webhookSecret: "s", chatId: 100 }, links: { pinnedMsgUrlByTopic: {}, charterUrl: "https://x" } } as any,
    bot: { sendMessage } as any
  };
};

describe("/help", () => {
  it("returns the full command list when invoked without args", async () => {
    const input = makeInput("/help");
    await handleHelp(input);
    expect(input.bot.sendMessage).toHaveBeenCalledTimes(1);
    const text = input.bot.sendMessage.mock.calls[0]?.[2];
    expect(text).toContain("/ask");
    expect(text).toContain("/search");
    expect(text).toContain("/help");
  });

  it("returns command detail for /help <command>", async () => {
    const input = makeInput("/help ask");
    await handleHelp(input);
    const text = input.bot.sendMessage.mock.calls[0]?.[2];
    expect(text).toContain("/ask <question>");
    expect(text).toContain("Privacy:");
  });

  it("returns 'no such command' for an unknown argument", async () => {
    const input = makeInput("/help nonexistent");
    await handleHelp(input);
    const text = input.bot.sendMessage.mock.calls[0]?.[2];
    expect(text).toContain("no such command");
  });
});
