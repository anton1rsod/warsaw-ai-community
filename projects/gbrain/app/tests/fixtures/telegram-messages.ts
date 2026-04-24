import type { TelegramMessage } from "../../src/types";

export const MSG_NEWS_RAW: TelegramMessage = {
  message_id: 100,
  date: new Date("2026-04-24T08:00:00Z").getTime() / 1000,
  chat: { id: -1001234567890, type: "supergroup" },
  message_thread_id: 6,
  from: { id: 500, username: "alice", first_name: "Alice" },
  text: "DeepSeek V4 Pro just launched https://deepseek.ai/v4 — matches Claude Opus 4.5."
};

export const MSG_QA_WITHOUT_TAG: TelegramMessage = {
  message_id: 101,
  date: new Date("2026-04-24T09:00:00Z").getTime() / 1000,
  chat: { id: -1001234567890, type: "supergroup" },
  message_thread_id: 2,
  from: { id: 501, username: "bob", first_name: "Bob" },
  text: "How do I run Llama 3 on a Mac?"
};

export const MSG_QA_WITH_KB: TelegramMessage = {
  ...MSG_QA_WITHOUT_TAG,
  message_id: 102,
  text: "How do I run Llama 3 on a Mac? Here's my solution: use LM Studio. #kb"
};

export function webhookBody(msg: TelegramMessage) {
  return { update_id: 1, message: msg };
}
