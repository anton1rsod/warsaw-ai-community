import { NextResponse, type NextRequest } from "next/server";
import { loadConfig } from "@/config";
import { verifyWebhookSecret } from "@/telegram/verify";
import { createBotClient } from "@/telegram/client";
import { createGithubStore } from "@/store/index";
import { createNewsLogStore } from "@/digest/news-log";
import { createInMemoryPreferences } from "@/consent/preferences";
import { createInMemoryPendingStore } from "@/pending/index";
import { handleForget } from "@/commands/forget";
import { handleOptOut, handleOptIn } from "@/commands/optout";
import { handleStatus } from "@/commands/status";
import { handleConfirm } from "@/commands/confirm";
import { ingestOne } from "@/pipeline";
import type { TelegramMessage } from "@/types";

// Next.js route config: ensure every POST runs live on Node, never cached or assigned to Edge.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Singletons — acceptable for Phase 1 (Fluid Compute reuses instances).
// Phase 2: migrate prefs + pending to Vercel KV.
const prefs = createInMemoryPreferences();
const pending = createInMemoryPendingStore();

export async function POST(req: NextRequest): Promise<NextResponse> {
  const cfg = loadConfig();

  if (!verifyWebhookSecret(req.headers, cfg.telegram.webhookSecret)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  if (cfg.flags.killSwitch) {
    // 200 so Telegram stops retrying; flag it to operators via the body.
    return NextResponse.json({ ok: true, killed: true });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid json" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !("message" in body)) {
    return NextResponse.json({ ok: true, reason: "no message in update" });
  }

  const msg = (body as { message: TelegramMessage }).message;

  if (!msg.from) {
    // Channel posts don't have `from`; skip silently.
    return NextResponse.json({ ok: true, reason: "no from field" });
  }

  const isDM = msg.chat.type === "private";
  const text = msg.text ?? "";
  const bot = createBotClient(cfg);
  const store = createGithubStore(cfg.github);

  if (isDM) {
    if (text.startsWith("/gbrain-forget")) {
      const result = await handleForget({
        authorId: msg.from.id,
        isCoreOrganizer: false, // TODO roster integration per ADR-0002
        messageText: text,
        store,
        // Phase 1 stub: the author of the command is treated as the owner of the path.
        // Phase 2 should fetch `author_id` from the file's frontmatter via the store
        // to enforce real ownership across users.
        ownerOfPath: async () => msg.from.id
      });
      await bot.sendDirectMessage(
        msg.from.id,
        result.ok ? "Removed." : `Cannot remove: ${result.reason}`
      );
      return NextResponse.json({ ok: result.ok, reason: result.reason });
    }

    if (text.startsWith("/gbrain-optout")) {
      const result = await handleOptOut({ authorId: msg.from.id, prefs });
      await bot.sendDirectMessage(msg.from.id, "You are opted out of GBrain archiving.");
      return NextResponse.json({ ok: result.ok });
    }

    if (text.startsWith("/gbrain-optin")) {
      const result = await handleOptIn({ authorId: msg.from.id, prefs });
      await bot.sendDirectMessage(msg.from.id, "You are opted in to GBrain archiving.");
      return NextResponse.json({ ok: result.ok });
    }

    if (text.startsWith("/gbrain-status")) {
      const result = await handleStatus({ authorId: msg.from.id, prefs });
      await bot.sendDirectMessage(msg.from.id, result.message);
      return NextResponse.json({ ok: true });
    }

    const trimmed = text.trim();
    if (trimmed === "/yes" || trimmed === "/no") {
      // v0.1 limitation: confirmation matches most recent pending entry for this author
      // only if the entry id contains the author id. Phase 2 needs an author→entry index
      // so this path is load-bearing once require_confirm becomes reachable.
      const authorTag = `${msg.from.id}`;
      const entries = pending.all().filter((e) => e.id.includes(authorTag));
      const entry = entries.at(-1);
      if (entry) {
        const result = await handleConfirm({
          decision: trimmed === "/yes" ? "yes" : "no",
          entryId: entry.id,
          pending
        });
        await bot.sendDirectMessage(
          msg.from.id,
          result.ok && result.action === "cancelled"
            ? "Cancelled."
            : result.ok
              ? "Confirmed. Will be archived on next flush."
              : "That confirmation is no longer pending."
        );
        return NextResponse.json({ ok: result.ok, action: result.action });
      }
      await bot.sendDirectMessage(msg.from.id, "Nothing to confirm.");
      return NextResponse.json({ ok: true, reason: "no pending entry" });
    }

    // Unrecognised DM — ignore silently.
    return NextResponse.json({ ok: true, reason: "unrecognised dm command" });
  }

  // Supergroup message — run the ingestion pipeline.
  if (msg.chat.id !== cfg.telegram.chatId) {
    // Not our chat — ignore.
    return NextResponse.json({ ok: true, reason: "wrong chat" });
  }

  const newsLog = createNewsLogStore({ github: store, namespace: cfg.archive.namespace });
  const outcome = await ingestOne(msg, { cfg, bot, store, prefs, pending, newsLog });
  return NextResponse.json({ ok: true, handled: outcome.handled, reason: outcome.reason });
}
