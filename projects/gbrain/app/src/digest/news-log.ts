import type { ParsedMessage, TelegramMessage, TopicClass } from "../types";
import type { GithubStore } from "../store/index";

export interface NewsLogStore {
  record(msg: ParsedMessage): Promise<void>;
  snapshot(opts: { since: Date; until?: Date }): Promise<ParsedMessage[]>;
}

interface SerializedNewsRow {
  raw: TelegramMessage;
  tags: string[];
  topicId: number | null;
  topicClass: TopicClass;
  authorHandle: string;
  plainText: string;
  timestamp: string;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function basePath(namespace: string): string {
  const ns = namespace ? `${namespace}/` : "";
  return `community/archive/${ns}_news-log`;
}

function fileName(msg: ParsedMessage): string {
  const stamp = msg.timestamp.toISOString().replace(/[:.]/g, "-");
  return `${stamp}-${msg.raw.message_id}.json`;
}

function enumerateDays(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cur = new Date(start.getTime());
  cur.setUTCHours(0, 0, 0, 0);
  const last = new Date(end.getTime());
  last.setUTCHours(0, 0, 0, 0);
  while (cur.getTime() <= last.getTime()) {
    keys.push(dayKey(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return keys;
}

function serialize(msg: ParsedMessage): SerializedNewsRow {
  return {
    raw: msg.raw,
    tags: [...msg.tags],
    topicId: msg.topicId,
    topicClass: msg.topicClass,
    authorHandle: msg.authorHandle,
    plainText: msg.plainText,
    timestamp: msg.timestamp.toISOString()
  };
}

function deserialize(row: SerializedNewsRow): ParsedMessage {
  return {
    raw: row.raw,
    tags: new Set(row.tags),
    topicId: row.topicId,
    topicClass: row.topicClass,
    authorHandle: row.authorHandle,
    plainText: row.plainText,
    timestamp: new Date(row.timestamp)
  };
}

export function createNewsLogStore(deps: {
  github: GithubStore;
  namespace: string;
}): NewsLogStore {
  const root = basePath(deps.namespace);

  return {
    async record(msg: ParsedMessage): Promise<void> {
      const day = dayKey(msg.timestamp);
      const path = `${root}/${day}/${fileName(msg)}`;
      await deps.github.commit({
        path,
        content: JSON.stringify(serialize(msg), null, 2),
        message: `news-log: ${msg.authorHandle} ${day} #${msg.raw.message_id}`
      });
    },

    async snapshot({ since, until }: { since: Date; until?: Date }): Promise<ParsedMessage[]> {
      const days = enumerateDays(since, until ?? new Date());
      const results: ParsedMessage[] = [];
      for (const day of days) {
        const dayPath = `${root}/${day}`;
        const entries = await deps.github.listDir(dayPath);
        for (const entry of entries) {
          if (entry.type !== "file" || !entry.name.endsWith(".json")) continue;
          const row = await deps.github.readJson<SerializedNewsRow>(entry.path);
          if (row) results.push(deserialize(row));
        }
      }
      return results;
    }
  };
}
