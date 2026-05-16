import { generateText, embed as aiEmbed } from "ai";
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
//
// Provider is constructed lazily so missing GEMINI_API_KEY surfaces as a clear
// startup error from the first summarise() call rather than as a silent empty
// header that becomes a confusing 401 from Gemini. Module-load construction
// with `?? ""` would not throw here even though loadConfig() would catch it
// later — better to fail fast at the boundary that actually needs the key.
let cachedProvider: ReturnType<typeof createGoogleGenerativeAI> | null = null;
function getGoogle(): ReturnType<typeof createGoogleGenerativeAI> {
  if (cachedProvider) return cachedProvider;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required but not set");
  }
  cachedProvider = createGoogleGenerativeAI({ apiKey });
  return cachedProvider;
}

export interface SummariseInput {
  model: string; // e.g. "gemini-2.5-flash" (direct Google Generative AI)
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export async function summarise(input: SummariseInput): Promise<AiResult> {
  const res = await generateText({
    model: getGoogle()(input.model),
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

export interface AnswerInput {
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
}

/**
 * Generation call tuned for /ask: more deterministic citation behavior than
 * the digest's summarise(). Per spec §4.1.
 */
export async function answer(input: AnswerInput): Promise<AiResult> {
  const res = await generateText({
    model: getGoogle()("gemini-2.5-flash"),
    prompt: input.prompt,
    maxOutputTokens: input.maxOutputTokens ?? 600,
    temperature: input.temperature ?? 0.2
  });
  return {
    text: res.text,
    usage: {
      inputTokens: res.usage?.inputTokens ?? 0,
      outputTokens: res.usage?.outputTokens ?? 0
    },
    model: "gemini-2.5-flash"
  };
}

/**
 * Embed a query via gemini-embedding-001. 768-dim output.
 * Per spec §3.1 + ADR-0008. Gemini's default output is 3072 dims (the model's
 * full Matryoshka-trained size); we explicitly request 768 to match the schema
 * pin. Truncation is safe: the model is trained such that the first N dims of
 * the 3072-dim vector are a valid lower-dim representation (MRL).
 */
export async function embed(text: string): Promise<number[]> {
  const result = await aiEmbed({
    model: getGoogle().embedding("gemini-embedding-001"),
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: 768
      }
    }
  });
  return result.embedding;
}
