import { describe, it, expect, beforeEach, afterEach } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("config.loadConfig()", () => {
  beforeEach(() => {
    for (const k of Object.keys(process.env)) delete process.env[k];
  });
  afterEach(() => {
    for (const k of Object.keys(process.env)) delete process.env[k];
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it("throws when required vars are missing", async () => {
    const { loadConfig } = await import("../../src/config");
    expect(() => loadConfig()).toThrow(/TELEGRAM_BOT_TOKEN/);
  });

  it("returns a typed config when all required vars are present", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "1234567890:ab";
    process.env.TELEGRAM_WEBHOOK_SECRET = "s3cret";
    process.env.AI_GATEWAY_API_KEY = "gw_key";
    process.env.GITHUB_BOT_TOKEN = "ghp_abc123";
    process.env.GITHUB_REPO_OWNER = "warsaw-ai";
    process.env.GITHUB_REPO_NAME = "community";
    process.env.CHAT_ID = "-1001234567890";
    process.env.TOPIC_NEWS_ID = "42";
    process.env.CRON_SECRET = "cronsec";
    const { loadConfig } = await import("../../src/config");
    const cfg = loadConfig();
    expect(cfg.telegram.token).toBe("1234567890:ab");
    expect(cfg.telegram.chatId).toBe(-1001234567890);
    expect(cfg.topics.newsSignalsId).toBe(42);
    expect(cfg.flags.killSwitch).toBe(false);
    expect(cfg.flags.digestEnabled).toBe(true);
  });

  it("treats GBRAIN_KILL_SWITCH=true as killed", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "1234567890:ab";
    process.env.TELEGRAM_WEBHOOK_SECRET = "sec4";
    process.env.AI_GATEWAY_API_KEY = "gkey";
    process.env.GITHUB_BOT_TOKEN = "ghp_abc123";
    process.env.GITHUB_REPO_OWNER = "warsaw-ai";
    process.env.GITHUB_REPO_NAME = "community";
    process.env.CHAT_ID = "-1001";
    process.env.TOPIC_NEWS_ID = "1";
    process.env.CRON_SECRET = "csec";
    process.env.GBRAIN_KILL_SWITCH = "true";
    const { loadConfig } = await import("../../src/config");
    expect(loadConfig().flags.killSwitch).toBe(true);
  });
});
