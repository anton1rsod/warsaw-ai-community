import type { TelegramMessage } from "./types";
import type { BotClient } from "./telegram/client";
import type { GithubStore } from "./store/index";
import type { PreferencesStore } from "./consent/preferences";
import type { PendingStore } from "./pending/index";
import type { NewsLogStore } from "./digest/news-log";
import { buildTopicMap } from "./topics";
import { parseMessage } from "./ingest/parse";
import { evaluate } from "./consent/index";
import { toMarkdown } from "./ingest/index";
import { buildSlug } from "./ingest/slug";
import { loadConfig, type Config } from "./config";

export interface PipelineDeps {
  cfg?: Config;
  bot: BotClient;
  store: GithubStore;
  prefs: PreferencesStore;
  pending: PendingStore;
  newsLog: NewsLogStore;
  now?: () => Date;
}

export interface IngestOutcome {
  handled: "allow-committed" | "confirm-dm-sent" | "deferred" | "denied";
  reason: string;
}

export async function ingestOne(raw: TelegramMessage, deps: PipelineDeps): Promise<IngestOutcome> {
  const cfg = deps.cfg ?? loadConfig();
  const now = deps.now?.() ?? new Date();
  const topics = buildTopicMap(cfg);
  const parsed = parseMessage({ raw, topics });

  if (parsed.topicId === cfg.topics.newsSignalsId) await deps.newsLog.record(parsed);

  const prefs = await deps.prefs.get(raw.from.id);
  const decision = evaluate({ message: parsed, prefs, taggerIsAuthor: true, now });

  if (decision.kind === "deny") {
    return { handled: "denied", reason: decision.reason };
  }

  if (decision.kind === "require_confirm") {
    await deps.bot.sendDirectMessage(
      decision.confirmFrom,
      `Your message "${parsed.plainText.slice(0, 80)}…" was flagged for the GBrain archive by another member. Reply /yes or /no (48h timeout = auto-no). Reason: ${decision.reason}`
    );
    return { handled: "confirm-dm-sent", reason: decision.reason };
  }

  const topicName = topics.get(parsed.topicId ?? -1)?.name ?? "Unknown";
  const slug = buildSlug({
    timestamp: parsed.timestamp,
    topicName,
    plainText: parsed.plainText,
    messageId: raw.message_id
  });
  const month = parsed.timestamp.toISOString().slice(0, 7); // "YYYY-MM"
  const namespacePart = cfg.archive.namespace ? `${cfg.archive.namespace}/` : "";
  const path = `community/archive/${namespacePart}${month}/${slug}.md`;
  const content = toMarkdown({ message: parsed, topicName, chatIdForLink: cfg.telegram.chatId });
  const commitMessage = `archive: ${topicName} — ${parsed.authorHandle} — ${parsed.timestamp.toISOString()}`;

  if (decision.kind === "allow") {
    await deps.store.commit({ path, content, message: commitMessage });
    await deps.bot.setReaction(cfg.telegram.chatId, raw.message_id, "👀");
    return { handled: "allow-committed", reason: decision.reason };
  }

  // defer_48h
  deps.pending.enqueue({
    id: `${cfg.telegram.chatId}:${raw.message_id}`,
    messagePath: path,
    content,
    commitMessage,
    enqueuedAt: now
  });
  await deps.bot.setReaction(cfg.telegram.chatId, raw.message_id, "🤔");
  return { handled: "deferred", reason: decision.reason };
}
