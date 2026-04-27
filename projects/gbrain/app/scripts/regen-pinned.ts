#!/usr/bin/env tsx
import { generatePinnedMessage } from "../src/help/pinned";
import { TOPIC_BLURBS } from "../src/help/topics";
import pkg from "../package.json" with { type: "json" };

// Allowlist: known staging chat ids. Founder fills locally before first run.
const STAGING_CHAT_IDS = new Set<number>([
  // -100xxxxxxxxxx  (gbrain-staging supergroup id)
]);

const args = process.argv.slice(2);
const confirmArg = args.find((a) => a.startsWith("--confirm-chat-id="));
const allowNonStaging = args.includes("--allow-non-staging");
if (!confirmArg) {
  console.error("Refusing to run without --confirm-chat-id=<id>");
  process.exit(1);
}
const confirmId = Number(confirmArg.split("=")[1]);
if (!STAGING_CHAT_IDS.has(confirmId) && !allowNonStaging) {
  console.error(`Chat id ${confirmId} is not in the staging allowlist. Add --allow-non-staging only for Phase E.`);
  process.exit(1);
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID ? Number(process.env.CHAT_ID) : null;
if (!token || !chatId || chatId !== confirmId) {
  console.error("TELEGRAM_BOT_TOKEN and CHAT_ID env required, and CHAT_ID must match --confirm-chat-id");
  process.exit(1);
}

async function main() {
  for (const [key, info] of Object.entries(TOPIC_BLURBS)) {
    const topicIdEnv = process.env[`TOPIC_${key.toUpperCase()}_ID`];
    if (!topicIdEnv) continue;
    const message = generatePinnedMessage({
      gbrainVersion: pkg.version,
      charterUrl: process.env.CHARTER_URL ?? "https://github.com/warsaw-ai/community/blob/main/community/charter/charter.md",
      topicName: info.name,
      topicBlurb: info.blurb
    });
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_thread_id: Number(topicIdEnv), text: message })
    });
    if (!res.ok) {
      console.error(`Failed to post to topic ${key}: ${res.status}`);
      continue;
    }
    const data = await res.json() as { result?: { message_id: number } };
    const msgId = data.result?.message_id;
    if (msgId) {
      await fetch(`https://api.telegram.org/bot${token}/pinChatMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, message_id: msgId })
      });
      console.log(`Pinned message ${msgId} in topic ${key} (${topicIdEnv})`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
