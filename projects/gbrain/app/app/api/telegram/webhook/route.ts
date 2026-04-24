import { NextResponse, type NextRequest } from "next/server";
import { loadConfig } from "@/config";
import { verifyWebhookSecret } from "@/telegram/verify";
import { createBotClient } from "@/telegram/client";
import { createGithubStore } from "@/store/index";
import { createInMemoryPreferences } from "@/consent/preferences";
import { createInMemoryPendingStore } from "@/pending/index";
import { handleForget } from "@/commands/forget";
import { handleOptOut, handleOptIn } from "@/commands/optout";
import { handleStatus } from "@/commands/status";
import { ingestOne } from "@/pipeline";
import type { TelegramMessage } from "@/types";

// Singletons — acceptable for Phase 1 (serverless cold start each invocation).
// Phase 2: migrate prefs + pending to Vercel KV.
const prefs = createInMemoryPreferences();
const pending = createInMemoryPendingStore();

export async function POST(req: NextRequest): Promise<NextResponse> {
  const cfg = loadConfig();

  if (cfg.flags.killSwitch) {
    return NextResponse.json({ ok: false, reason: "kill switch active" }, { status: 503 });
  }

  if (!verifyWebhookSecret(req.headers, cfg.telegram.webhookSecret)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
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
        isCoreOrganizer: false,
        messageText: text,
        store,
        ownerOfPath: async () => null
      });
      return NextResponse.json({ ok: result.ok, reason: result.reason });
    }

    if (text.startsWith("/gbrain-optout")) {
      const result = await handleOptOut({ authorId: msg.from.id, prefs });
      return NextResponse.json({ ok: result.ok });
    }

    if (text.startsWith("/gbrain-optin")) {
      const result = await handleOptIn({ authorId: msg.from.id, prefs });
      return NextResponse.json({ ok: result.ok });
    }

    if (text.startsWith("/gbrain-status")) {
      const result = await handleStatus({ authorId: msg.from.id, prefs });
      await bot.sendDirectMessage(msg.from.id, result.message);
      return NextResponse.json({ ok: true });
    }

    // Unrecognised DM — ignore silently.
    return NextResponse.json({ ok: true, reason: "unrecognised dm command" });
  }

  // Supergroup message — run the ingestion pipeline.
  if (msg.chat.id !== cfg.telegram.chatId) {
    // Not our chat — ignore.
    return NextResponse.json({ ok: true, reason: "wrong chat" });
  }

  const outcome = await ingestOne(msg, { cfg, bot, store, prefs, pending });
  return NextResponse.json({ ok: true, handled: outcome.handled, reason: outcome.reason });
}
