import { generateText } from "ai";
import type { AiResult } from "../types";

export interface SummariseInput {
  model: string; // e.g. "google/gemini-2.0-flash" (Vercel AI Gateway routing)
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export async function summarise(input: SummariseInput): Promise<AiResult> {
  const res = await generateText({
    model: input.model,
    prompt: input.prompt,
    maxOutputTokens: input.maxOutputTokens ?? 1500,
    temperature: input.temperature ?? 0.3
  });
  return {
    text: res.text,
    usage: {
      inputTokens: res.usage?.inputTokens ?? 0,
      outputTokens: res.usage?.outputTokens ?? 0
    },
    model: input.model
  };
}
