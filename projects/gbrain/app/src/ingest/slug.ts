export interface SlugInput {
  timestamp: Date;
  topicName: string;
  plainText: string;
  messageId?: number;
}

const MAX_BODY_CHARS = 34;

function kebab(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function datePart(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildSlug(input: SlugInput): string {
  const topic = kebab(input.topicName);
  const body = kebab(input.plainText).slice(0, MAX_BODY_CHARS).replace(/-+$/, "");
  const date = datePart(input.timestamp);
  if (body.length > 0) return `${date}-${topic}-${body}`;
  if (typeof input.messageId === "number") return `${date}-${topic}-msg-${input.messageId}`;
  return `${date}-${topic}-untitled`;
}
