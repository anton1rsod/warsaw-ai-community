import type { NextResponse } from "next/server";
import type { ParsedMessage } from "../types";
import type { Config } from "../config";
import type { BotClient } from "../telegram/client";

// Inline literal union — kept self-contained so registry imports don't pull
// in rate-limit/. Per spec §5 v2.1 fix.
export type RateLimitKey = "ask" | "search";

export interface CommandHandlerInput {
  parsed: ParsedMessage;
  config: Config;
  bot: BotClient;
}

export type CommandHandler = (input: CommandHandlerInput) => Promise<NextResponse>;

export interface CommandSpec {
  description: string;       // for /help short list
  detail: string;            // for /help <command>
  surfaces: readonly ("topic" | "dm")[];
  rateLimitKey?: RateLimitKey;
}

export const COMMAND_REGISTRY = {
  ask: {
    description: "Ask a question; get a cited answer from the archive.",
    detail: [
      "/ask <question>",
      "",
      "What it does:",
      "  Searches the community archive for relevant content, then asks Gemini",
      "  to generate a plain-language answer citing the sources it used.",
      "",
      "Where to use:",
      "  Any topic in the community channel, or DM the bot directly.",
      "",
      "What it cites:",
      "  • Inline excerpts from #kb-tagged messages",
      "  • Author handle + timestamp + topic",
      "  • A GitHub link to the exact lines in the archive",
      "",
      "Privacy:",
      "  Your question is not stored. Only the answer is returned to you in the",
      "  same place you asked.",
      "",
      "Caveat:",
      "  GBrain answers from member contributions. Citations show where each",
      "  excerpt came from, but cited content is not fact-checked. Trust but",
      "  verify."
    ].join("\n"),
    surfaces: ["topic", "dm"] as const,
    rateLimitKey: "ask"
  },
  search: {
    description: "Find archived items matching a query (list view).",
    detail: [
      "/search <query>",
      "",
      "What it does:",
      "  Returns a ranked list of #kb-tagged archive items most similar to your",
      "  query. No LLM-generated answer — raw retrieval.",
      "",
      "Where to use:",
      "  Any topic in the community channel, or DM the bot directly."
    ].join("\n"),
    surfaces: ["topic", "dm"] as const,
    rateLimitKey: "search"
  },
  help: {
    description: "List GBrain commands.",
    detail: "/help, or /help <command> for details on a specific command.",
    surfaces: ["topic", "dm"] as const
  },
  "gbrain-forget": {
    description: "Remove a message of yours from the archive.",
    detail: "/gbrain-forget <message-link> — DM only.",
    surfaces: ["dm"] as const
  },
  "gbrain-optout": {
    description: "Stop archiving anything you write.",
    detail: "/gbrain-optout — DM only.",
    surfaces: ["dm"] as const
  },
  "gbrain-status": {
    description: "What GBrain has of yours and what's pending.",
    detail: "/gbrain-status — DM only.",
    surfaces: ["dm"] as const
  }
} as const satisfies Record<string, CommandSpec>;

export type CommandName = keyof typeof COMMAND_REGISTRY;
