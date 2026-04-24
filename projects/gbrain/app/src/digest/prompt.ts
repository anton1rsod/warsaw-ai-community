import type { DigestItem } from "./select";

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface PromptInput {
  date: Date;
  messages: DigestItem[];
}

export function buildDigestPrompt(input: PromptInput): string {
  const { date, messages } = input;
  const day = isoDay(date);

  if (messages.length === 0) {
    return `You are GBrain, a concise daily-news summariser for the Warsaw AI Community.
There are no messages to digest for ${day}.
Respond with a single short line: "No notable News & Signals activity today."`;
  }

  const items = messages
    .map(
      (m, i) => `${i + 1}. [${m.author}] ${m.text}\n   source: ${m.source}`
    )
    .join("\n\n");

  return `You are GBrain, the daily-digest summariser for the Warsaw AI Community (Telegram).
Summarise the News & Signals from ${day}. Constraints:
- Output a tight Markdown bullet list.
- For each notable item: a bold headline, a short factual description, a source link, and a one-sentence "why it matters".
- Cluster related items. Skip chatter that isn't news.
- Max 12 bullets. Prefer signal over volume.
- Do not add commentary outside the list.

Source messages:

${items}`;
}
