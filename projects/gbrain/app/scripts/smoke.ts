// projects/gbrain/app/scripts/smoke.ts
// Run: npm run smoke
// Requires: a staging TELEGRAM_BOT_TOKEN and CHAT_ID exported in the local shell.

import { loadConfig } from "../src/config";
import { createBotClient } from "../src/telegram/client";

async function main(): Promise<void> {
  const cfg = loadConfig();
  const bot = createBotClient(cfg);

  console.log("Sending smoke test to chat:", cfg.telegram.chatId);
  await bot.sendMessage(
    cfg.telegram.chatId,
    cfg.topics.newsSignalsId,
    "🧠 GBrain smoke test — " + new Date().toISOString(),
    "Markdown"
  );
  console.log("OK. Check the channel.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
