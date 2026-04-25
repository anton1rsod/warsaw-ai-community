import { NextRequest, NextResponse } from "next/server";
import { loadConfig } from "@/config";
import { runDigest } from "@/digest/index";
import { createNewsLogStore } from "@/digest/news-log";
import { createBotClient } from "@/telegram/client";
import { createGithubStore } from "@/store/index";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const cfg = loadConfig();

  if (cfg.flags.killSwitch || !cfg.flags.digestEnabled) {
    return NextResponse.json({ ok: true, skipped: "disabled" });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${cfg.cron.secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const store = createGithubStore(cfg.github);
  const newsLog = createNewsLogStore({ github: store, namespace: cfg.archive.namespace });
  const now = new Date();
  const since = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS);
  const messages = await newsLog.snapshot({ since, until: now });
  const result = await runDigest({ messages, now });

  const bot = createBotClient(cfg);
  await bot.sendMessage(
    cfg.telegram.chatId,
    cfg.topics.newsSignalsId,
    result.markdown,
    "Markdown"
  );

  // Archive the digest itself (uses same namespace so staging digests stay isolated).
  const namespacePart = cfg.archive.namespace ? `${cfg.archive.namespace}/` : "";
  const day = now.toISOString().slice(0, 10);
  await store.commit({
    path: `community/archive/${namespacePart}digests/${day}.md`,
    content: result.markdown,
    message: `digest: ${day} — ${result.itemCount} items`
  });

  return NextResponse.json({
    ok: true,
    itemCount: result.itemCount,
    usage: result.usage,
    model: result.model
  });
}
