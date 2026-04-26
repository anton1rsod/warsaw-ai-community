import type { ParsedMessage } from "../types";
import { summarise } from "../ai/index";
import { selectRecent } from "./select";
import { buildDigestPrompt } from "./prompt";
import { renderDegradedDigest, renderDigest } from "./render";

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
  degraded?: boolean;
  /** TEMP DIAGNOSTIC — surfacing AI error during 0.1.1 C5 rehearsal. Revert. */
  diagnostic?: string;
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
  try {
    const ai = await summarise({ model, prompt, maxOutputTokens: 1500, temperature: 0.3 });
    return {
      markdown: renderDigest({ date: input.now, llmOutput: ai.text, itemCount: items.length }),
      itemCount: items.length,
      model,
      usage: ai.usage
    };
  } catch (e: unknown) {
    console.error("[gbrain.digest] summarise threw — degrading:", e);
    const errMsg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    return {
      markdown: renderDegradedDigest({ date: input.now, itemCount: items.length }),
      itemCount: items.length,
      model,
      usage: { inputTokens: 0, outputTokens: 0 },
      degraded: true,
      // TEMP DIAGNOSTIC — revert this field before tagging 0.1.1.
      // Surfacing the error name+message (not stack) lets us identify which AI
      // failure mode hit during C5 rehearsal without adding a debug endpoint.
      diagnostic: errMsg
    };
  }
}

export { selectRecent } from "./select";
export { buildDigestPrompt } from "./prompt";
export { renderDigest } from "./render";
