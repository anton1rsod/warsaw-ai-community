import type { ParsedMessage } from "../types";
import { summarise } from "../ai/index";
import { selectRecent } from "./select";
import { buildDigestPrompt } from "./prompt";
import { renderDigest } from "./render";

export interface RunDigestInput {
  messages: ParsedMessage[];
  now: Date;
  model?: string;
}

export interface RunDigestResult {
  markdown: string;
  itemCount: number;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
}

export async function runDigest(input: RunDigestInput): Promise<RunDigestResult> {
  const items = selectRecent(input.messages, input.now);
  const model = input.model ?? "google/gemini-2.0-flash";

  if (items.length === 0) {
    return {
      markdown: renderDigest({ date: input.now, llmOutput: "", itemCount: 0 }),
      itemCount: 0,
      model,
      usage: { inputTokens: 0, outputTokens: 0 }
    };
  }

  const prompt = buildDigestPrompt({ date: input.now, messages: items });
  const ai = await summarise({ model, prompt, maxOutputTokens: 1500, temperature: 0.3 });
  return {
    markdown: renderDigest({ date: input.now, llmOutput: ai.text, itemCount: items.length }),
    itemCount: items.length,
    model,
    usage: ai.usage
  };
}

export { selectRecent } from "./select";
export { buildDigestPrompt } from "./prompt";
export { renderDigest } from "./render";
