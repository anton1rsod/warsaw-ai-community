import type { ParsedMessage } from "../types";
import { renderFrontmatter } from "./frontmatter";

export interface ToMarkdownInput {
  message: ParsedMessage;
  topicName: string;
  chatIdForLink: number;
}

function telegramLink(chatId: number, threadId: number | undefined, messageId: number): string {
  // Telegram supergroup chat IDs look like -100XXXXXXXXXX; public link uses XXXXXXXXXX.
  const numeric = Math.abs(chatId).toString();
  const trimmed = numeric.startsWith("100") ? numeric.slice(3) : numeric;
  const thread = typeof threadId === "number" ? `${threadId}/` : "";
  return `https://t.me/c/${trimmed}/${thread}${messageId}`;
}

export function toMarkdown(input: ToMarkdownInput): string {
  const { message, topicName, chatIdForLink } = input;
  const fm = renderFrontmatter({
    topic: topicName,
    topic_id: message.topicId ?? "",
    author_handle: message.authorHandle,
    author_id: message.raw.from.id,
    timestamp: message.timestamp,
    source: telegramLink(chatIdForLink, message.raw.message_thread_id, message.raw.message_id),
    tags: Array.from(message.tags).sort(),
    topic_class: message.topicClass
  });
  return `${fm}\n\n${message.plainText}\n`;
}
