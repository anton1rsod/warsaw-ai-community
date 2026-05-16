import { NextResponse } from "next/server";
import type { CommandHandler } from "../help/registry";
import { getIndex } from "../retrieval/load";
import { topK } from "../retrieval/cosine";
import { embed, answer } from "../ai/gateway";
import { renderAskPrompt, type AskExcerpt } from "../prompts/ask";
import { validateAndPruneCitations } from "../retrieval/cite";
import { checkRateLimit } from "../rate-limit";
import { escapeMd, formatLinkMd } from "../telegram/format";

const K = 5;
// Calibrated 2026-05-16 via scripts/calibrate-fixtures.ts (sandbox, N=6).
// Score distribution from gemini-embedding-001 against the fixture corpus:
//   positives (sorted asc): [0.556, 0.634, 0.679]
//   negatives (sorted desc): [0.542, 0.514, 0.468]
// Empirical midpoint 0.549; accepted 0.55 with slight precision bias (false
// positives erode /ask trust faster than false negatives). Margin to nearest
// negative: 0.008. Retune scheduled for 0.2.x once real-channel corpus accrues
// per spec §9.3 OQ-1 + closeout doc §3.
export const ASK_SIMILARITY_THRESHOLD = 0.55;

export const handleAsk: CommandHandler = async ({ parsed, bot }) => {
  const text = parsed.plainText.trim();
  const question = text.replace(/^\/ask\s*/, "").trim();
  const chatId = parsed.raw.chat.id;
  const threadId = parsed.topicId ?? undefined;

  if (question.length < 3) {
    await bot.sendMessage(chatId, threadId, "Usage: /ask <question>  (min 3 chars)");
    return NextResponse.json({ ok: true });
  }
  if (question.length > 800) {
    await bot.sendMessage(chatId, threadId, "Your question is too long; try splitting it.");
    return NextResponse.json({ ok: true });
  }

  const rl = checkRateLimit({ userId: parsed.raw.from.id, key: "ask" });
  if (!rl.allowed) {
    const retryAt = rl.retryAtIso ?? "later";
    await bot.sendMessage(chatId, threadId, `Rate limit reached: max 10 /ask per hour. Try again at ${retryAt}.`);
    return NextResponse.json({ ok: true });
  }

  const index = getIndex();
  if ("reason" in index) {
    await bot.sendMessage(chatId, threadId, "The community archive index is temporarily unavailable; please retry shortly.");
    return NextResponse.json({ ok: true });
  }

  const queryEmbedding = await embed(question);
  const ranked = topK(queryEmbedding, index.entries, K);
  const filtered = ranked.filter((r) => r.score >= ASK_SIMILARITY_THRESHOLD);

  if (filtered.length === 0) {
    await bot.sendMessage(
      chatId,
      threadId,
      "I don't have anything in the archive about that. Try /search for keyword-style results, or wait for more #kb content."
    );
    return NextResponse.json({ ok: true });
  }

  const excerpts: AskExcerpt[] = filtered.map((r, i) => ({
    id: i + 1,
    sourcePath: r.entry.source_path,
    lineStart: r.entry.source_lines[0] ?? 0,
    lineEnd: r.entry.source_lines[1] ?? 0,
    authorHandle: r.entry.metadata.author_handle,
    date: r.entry.metadata.timestamp_iso.slice(0, 10),
    topic: r.entry.metadata.topic,
    content: r.entry.content_preview
  }));

  const prompt = renderAskPrompt({ excerpts, question });
  const result = await answer({ prompt });
  const validatedAnswer = validateAndPruneCitations(result.text, excerpts.length);

  // Render reply with MarkdownV2 escaping for the answer text + citation footer.
  const replyLines = [escapeMd(validatedAnswer), "", "──"];
  filtered.forEach((r, i) => {
    const e = r.entry;
    const id = i + 1;
    const preview = e.content_preview.slice(0, 120);
    replyLines.push(
      `\\[${id}\\] ${escapeMd(e.metadata.author_handle)}, ${escapeMd(e.metadata.timestamp_iso.slice(0, 10))} in ${escapeMd(e.metadata.topic)}: "${escapeMd(preview)}…"`
    );
    replyLines.push(`   ${formatLinkMd("source", e.metadata.source_link)}`);
  });
  replyLines.push("");
  replyLines.push("GBrain answers from member\\-tagged archive content; citations are sources, not fact\\-checks\\.");

  await bot.sendMessage(chatId, threadId, replyLines.join("\n"), "MarkdownV2");
  return NextResponse.json({ ok: true });
};
