import type { ParsedMessage } from "../types";

export interface DigestItem {
  author: string;
  text: string;
  source: string;
  timestamp: Date;
}

export function selectRecent(
  messages: ParsedMessage[],
  now: Date,
  hours = 24,
  limit = 40
): DigestItem[] {
  const cutoff = now.getTime() - hours * 60 * 60 * 1000;
  return messages
    .filter(m => !m.tags.has("skip"))
    .filter(m => m.timestamp.getTime() >= cutoff)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .slice(0, limit)
    .map(m => ({
      author: m.authorHandle,
      text: m.plainText.trim(),
      source: `https://t.me/c/${Math.abs(m.raw.chat.id).toString().replace(/^100/, "")}/${m.raw.message_thread_id ?? ""}/${m.raw.message_id}`,
      timestamp: m.timestamp
    }));
}
