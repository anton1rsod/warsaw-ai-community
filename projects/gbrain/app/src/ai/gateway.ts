import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { AiResult } from "../types";

// 0.1.1: bypass Vercel AI Gateway (it requires a credit card on file even for
// the free tier). Call Google's Gemini API directly via @ai-sdk/google. The
// existing GEMINI_API_KEY env is reused; AI_GATEWAY_API_KEY env is no longer
// consumed but left in place for fast rollback if needed.
//
// Trade-off: loses gateway-side multi-provider fail-over (Gemini → Claude →
// OpenAI). Gemini outages now degrade the digest (graceful — see runDigest).
// Re-evaluate at 0.3.0+ if fail-over becomes operationally important.
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY ?? ""
});

export interface SummariseInput {
  model: string; // e.g. "gemini-2.5-flash" (direct Google Generative AI)
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export async function summarise(input: SummariseInput): Promise<AiResult> {
  const res = await generateText({
    model: google(input.model),
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
