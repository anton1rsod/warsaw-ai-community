export type TopicClass = "formal" | "casual";

export interface TelegramMessage {
  message_id: number;
  date: number;
  chat: { id: number; type: string };
  message_thread_id?: number;
  from: { id: number; username?: string; first_name: string };
  text?: string;
  entities?: Array<{ type: string; offset: number; length: number }>;
  reply_to_message?: { message_id: number };
}

export interface ParsedMessage {
  raw: TelegramMessage;
  tags: Set<string>;
  topicId: number | null;
  topicClass: TopicClass;
  authorHandle: string;
  plainText: string;
  timestamp: Date;
}

export type ConsentDecision =
  | { kind: "allow"; reason: string }
  | { kind: "require_confirm"; reason: string; confirmFrom: number }
  | { kind: "defer_48h"; reason: string; deferUntil: Date }
  | { kind: "deny"; reason: string };

export interface AuthorPreferences {
  authorId: number;
  optedOut: boolean;
  updatedAt: Date;
}

export interface ArchiveEntry {
  slug: string;
  topicName: string;
  authorHandle: string;
  timestamp: Date;
  sourceLink: string;
  body: string;
  tags: string[];
  frontmatter: Record<string, unknown>;
}

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  costUsd?: number;
}
export interface AiResult {
  text: string;
  usage: AiUsage;
  model: string;
}
