export interface PinnedOpts {
  gbrainVersion: string;
  charterUrl: string;
  topicName: string;
  topicBlurb: string;
}

export function generatePinnedMessage(opts: PinnedOpts): string {
  return [
    "🧠 GBrain — quick reference",
    "",
    `In this topic (${opts.topicName}): ${opts.topicBlurb}`,
    "",
    "Common commands:",
    "  /ask <question>   — cited answer from archive",
    "  /search <query>   — list of relevant archive items",
    "  /help             — full command list",
    "",
    "Tag a message `#kb` to add it to the searchable archive",
    "(your DM consent will be requested first).",
    "",
    `Charter + consent rules: ${opts.charterUrl}`,
    `GBrain version: ${opts.gbrainVersion}`
  ].join("\n");
}
