import { NextResponse } from "next/server";
import { COMMAND_REGISTRY, type CommandHandlerInput, type CommandHandler } from "../help/registry";

export const handleHelp: CommandHandler = async (input: CommandHandlerInput) => {
  const text = input.parsed.plainText.trim();
  const argMatch = text.match(/^\/help\s+(\S+)/);
  const arg = argMatch?.[1];

  let reply: string;
  if (!arg) {
    reply = renderShortHelp(input);
  } else {
    const key = arg.startsWith("/") ? arg.slice(1) : arg;
    const spec = (COMMAND_REGISTRY as Record<string, { detail: string }>)[key];
    if (!spec) {
      reply = "no such command — see /help for the list.";
    } else {
      reply = spec.detail;
    }
  }

  await input.bot.sendMessage(
    input.parsed.raw.chat.id,
    input.parsed.topicId ?? undefined,
    reply
  );
  return NextResponse.json({ ok: true });
};

function renderShortHelp(input: CommandHandlerInput): string {
  const charter = input.config.links.charterUrl;
  const lines = ["GBrain commands:", ""];
  for (const [name, spec] of Object.entries(COMMAND_REGISTRY)) {
    const cmdName = `/${name}`;
    const padding = " ".repeat(Math.max(0, 20 - cmdName.length));
    lines.push(`${cmdName}${padding}— ${spec.description}`);
  }
  lines.push("");
  lines.push(`Full charter + consent rules: ${charter}`);
  return lines.join("\n");
}
