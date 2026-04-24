import { z } from "zod";

const schema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(10),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(4),

  AI_GATEWAY_API_KEY: z.string().min(4),
  GEMINI_API_KEY: z.string().optional(),

  GITHUB_BOT_TOKEN: z.string().min(8),
  GITHUB_REPO_OWNER: z.string().min(1),
  GITHUB_REPO_NAME: z.string().min(1),
  GITHUB_DEFAULT_BRANCH: z.string().default("main"),

  CHAT_ID: z.coerce.number().int(),
  TOPIC_GENERAL_ID: z.coerce.number().int().optional(),
  TOPIC_QA_ID: z.coerce.number().int().optional(),
  TOPIC_GUIDES_ID: z.coerce.number().int().optional(),
  TOPIC_MEETUPS_ID: z.coerce.number().int().optional(),
  TOPIC_PROJECTS_ID: z.coerce.number().int().optional(),
  TOPIC_NEWS_ID: z.coerce.number().int(),
  TOPIC_TOOLS_ID: z.coerce.number().int().optional(),
  TOPIC_PITCHES_ID: z.coerce.number().int().optional(),

  DIGEST_TIMEZONE: z.string().default("Europe/Warsaw"),
  DIGEST_HOUR_LOCAL: z.coerce.number().int().min(0).max(23).default(9),

  GBRAIN_KILL_SWITCH: z.enum(["true", "false"]).default("false"),
  DIGEST_ENABLED: z.enum(["true", "false"]).default("true"),

  CRON_SECRET: z.string().min(4)
});

export interface Config {
  telegram: { token: string; webhookSecret: string; chatId: number };
  ai: { gatewayKey: string; geminiKey: string | undefined };
  github: { token: string; owner: string; repo: string; branch: string };
  topics: {
    generalId: number | undefined;
    qaId: number | undefined;
    guidesId: number | undefined;
    meetupsId: number | undefined;
    projectsId: number | undefined;
    newsSignalsId: number;
    toolsId: number | undefined;
    pitchesId: number | undefined;
  };
  digest: { timezone: string; hourLocal: number };
  flags: { killSwitch: boolean; digestEnabled: boolean };
  cron: { secret: string };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing/invalid env vars: ${fields}`);
  }
  const e = parsed.data;
  return {
    telegram: {
      token: e.TELEGRAM_BOT_TOKEN,
      webhookSecret: e.TELEGRAM_WEBHOOK_SECRET,
      chatId: e.CHAT_ID
    },
    ai: { gatewayKey: e.AI_GATEWAY_API_KEY, geminiKey: e.GEMINI_API_KEY },
    github: {
      token: e.GITHUB_BOT_TOKEN,
      owner: e.GITHUB_REPO_OWNER,
      repo: e.GITHUB_REPO_NAME,
      branch: e.GITHUB_DEFAULT_BRANCH
    },
    topics: {
      generalId: e.TOPIC_GENERAL_ID,
      qaId: e.TOPIC_QA_ID,
      guidesId: e.TOPIC_GUIDES_ID,
      meetupsId: e.TOPIC_MEETUPS_ID,
      projectsId: e.TOPIC_PROJECTS_ID,
      newsSignalsId: e.TOPIC_NEWS_ID,
      toolsId: e.TOPIC_TOOLS_ID,
      pitchesId: e.TOPIC_PITCHES_ID
    },
    digest: { timezone: e.DIGEST_TIMEZONE, hourLocal: e.DIGEST_HOUR_LOCAL },
    flags: {
      killSwitch: e.GBRAIN_KILL_SWITCH === "true",
      digestEnabled: e.DIGEST_ENABLED === "true"
    },
    cron: { secret: e.CRON_SECRET }
  };
}
