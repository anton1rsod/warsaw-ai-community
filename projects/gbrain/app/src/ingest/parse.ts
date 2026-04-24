import type { TelegramMessage, ParsedMessage, TopicClass } from "../types";
import type { TopicInfo } from "../topics";

const TAG_RE = /#(kb|skip|archive|ad)\b/gi;

export interface ParseInput {
  raw: TelegramMessage;
  topics: Map<number, TopicInfo>;
}

export function parseMessage(input: ParseInput): ParsedMessage {
  const tags = new Set<string>();
  const text = input.raw.text ?? "";
  for (const m of text.matchAll(TAG_RE)) {
    const tag = m[1];
    if (tag) tags.add(tag.toLowerCase());
  }

  const topicId = input.raw.message_thread_id ?? null;
  const topicInfo = topicId !== null ? input.topics.get(topicId) : undefined;
  const topicClass: TopicClass = topicInfo?.class ?? "casual";

  const handle = input.raw.from.username
    ? input.raw.from.username
    : `user_${input.raw.from.id}`;

  return {
    raw: input.raw,
    tags,
    topicId: topicInfo ? topicId : null,
    topicClass,
    authorHandle: handle,
    plainText: text,
    timestamp: new Date(input.raw.date * 1000)
  };
}
