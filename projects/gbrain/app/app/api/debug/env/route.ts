import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get("authorization") ?? "";
  const expected = process.env.CRON_SECRET ?? "";
  if (!auth.startsWith("Bearer ") || auth.slice(7) !== expected || expected.length < 4) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let configLoad: { ok: boolean; error?: string; namespace?: string; chatId?: number } = { ok: false };
  try {
    const { loadConfig } = await import("@/config");
    const cfg = loadConfig();
    configLoad = { ok: true, namespace: cfg.archive.namespace, chatId: cfg.telegram.chatId };
  } catch (e: unknown) {
    configLoad = { ok: false, error: e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e) };
  }

  return NextResponse.json({
    raw_env: {
      ARCHIVE_NAMESPACE: process.env.ARCHIVE_NAMESPACE ?? "<undefined>",
      NODE_OPTIONS: process.env.NODE_OPTIONS ?? "<undefined>",
      CHAT_ID: process.env.CHAT_ID ?? "<undefined>",
      TOPIC_GUIDES_ID: process.env.TOPIC_GUIDES_ID ?? "<undefined>",
      TOPIC_NEWS_ID: process.env.TOPIC_NEWS_ID ?? "<undefined>",
      TOPIC_QA_ID: process.env.TOPIC_QA_ID ?? "<undefined>",
      DIGEST_ENABLED: process.env.DIGEST_ENABLED ?? "<undefined>",
      GBRAIN_KILL_SWITCH: process.env.GBRAIN_KILL_SWITCH ?? "<undefined>"
    },
    secrets_present: {
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_WEBHOOK_SECRET: !!process.env.TELEGRAM_WEBHOOK_SECRET,
      AI_GATEWAY_API_KEY: !!process.env.AI_GATEWAY_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      GITHUB_BOT_TOKEN: !!process.env.GITHUB_BOT_TOKEN,
      CRON_SECRET: !!process.env.CRON_SECRET
    },
    config_load: configLoad,
    runtime: { node: process.version, vercel_env: process.env.VERCEL_ENV ?? "<undefined>", region: process.env.VERCEL_REGION ?? "<undefined>" }
  });
}
