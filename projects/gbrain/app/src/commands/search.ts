import { NextResponse } from "next/server";
import type { CommandHandler } from "../help/registry";
import { getIndex } from "../retrieval/load";
import { topK } from "../retrieval/cosine";
import { embed } from "../ai/gateway";
import { checkRateLimit } from "../rate-limit";
import { escapeMd, formatLinkMd } from "../telegram/format";

const K = 10;
const SIMILARITY_FLOOR = 0.4;

export const handleSearch: CommandHandler = async ({ parsed, bot }) => {
  const text = parsed.plainText.trim();
  const query = text.replace(/^\/search\s*/, "").trim();
  const chatId = parsed.raw.chat.id;
  const threadId = parsed.topicId ?? undefined;

  if (query.length < 3) {
    await bot.sendMessage(chatId, threadId, "Usage: /search <query>  (min 3 chars)");
    return NextResponse.json({ ok: true });
  }
  if (query.length > 800) {
    await bot.sendMessage(chatId, threadId, "Your query is too long; try splitting it.");
    return NextResponse.json({ ok: true });
  }

  const rl = checkRateLimit({ userId: parsed.raw.from.id, key: "search" });
  if (!rl.allowed) {
    const retryAt = rl.retryAtIso ?? "later";
    await bot.sendMessage(chatId, threadId, `Rate limit reached: max 30 /search per hour. Try again at ${retryAt}.`);
    return NextResponse.json({ ok: true });
  }

  const index = getIndex();
  if ("reason" in index) {
    await bot.sendMessage(chatId, threadId, "The community archive index is temporarily unavailable; please retry shortly.");
    return NextResponse.json({ ok: true });
  }

  const queryEmbedding = await embed(query);
  const results = topK(queryEmbedding, index.entries, K);
  const filtered = results.filter((r) => r.score >= SIMILARITY_FLOOR);

  if (filtered.length === 0) {
    await bot.sendMessage(
      chatId,
      threadId,
      `I don't have anything in the archive about "${escapeMd(query)}". Wait for more #kb content, or try /ask for a generative answer.`,
      "MarkdownV2"
    );
    return NextResponse.json({ ok: true });
  }

  const lines = [`Top ${filtered.length} results for "${escapeMd(query)}":`, ""];
  filtered.forEach((r, i) => {
    const e = r.entry;
    const date = e.metadata.timestamp_iso.slice(0, 10);
    lines.push(`${i + 1}\\. ${escapeMd(e.metadata.author_handle)} in ${escapeMd(e.metadata.topic)} \\(${escapeMd(date)}\\)`);
    lines.push(`   "${escapeMd(e.content_preview)}…"`);
    lines.push(`   ${formatLinkMd("source", e.metadata.source_link)}`);
    lines.push("");
  });
  lines.push("These snippets are excerpted from the public archive on GitHub.");

  await bot.sendMessage(chatId, threadId, lines.join("\n"), "MarkdownV2");
  return NextResponse.json({ ok: true });
};
