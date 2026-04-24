import { Bot } from "grammy";
import type { ReactionTypeEmoji } from "@grammyjs/types";
import { loadConfig } from "../config";

export type ReactionEmoji = "👀" | "👍" | "👎" | "🤔" | "🎉" | "🔥" | "❤" | "🧠" | "⏳";

export interface BotClient {
  sendMessage(
    chatId: number,
    threadId: number | undefined,
    text: string,
    parseMode?: "Markdown" | "MarkdownV2" | "HTML"
  ): Promise<void>;
  sendDirectMessage(userId: number, text: string): Promise<void>;
  setReaction(
    chatId: number,
    messageId: number,
    emoji: ReactionEmoji
  ): Promise<void>;
}

export function createBotClient(cfg = loadConfig()): BotClient {
  const bot = new Bot(cfg.telegram.token);
  return {
    async sendMessage(chatId, threadId, text, parseMode = "Markdown") {
      await bot.api.sendMessage(chatId, text, {
        parse_mode: parseMode,
        link_preview_options: { is_disabled: true },
        ...(threadId !== undefined ? { message_thread_id: threadId } : {})
      });
    },
    async sendDirectMessage(userId, text) {
      await bot.api.sendMessage(userId, text, {
        link_preview_options: { is_disabled: true }
      });
    },
    async setReaction(chatId, messageId, emoji) {
      await bot.api.setMessageReaction(chatId, messageId, [
        { type: "emoji", emoji: emoji as ReactionTypeEmoji["emoji"] }
      ]);
    }
  };
}
