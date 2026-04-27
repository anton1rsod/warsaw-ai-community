import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => {
    const provider: any = (modelId: string) => ({ modelId, kind: "generate" });
    provider.embedding = (modelId: string) => ({ modelId, kind: "embed" });
    return provider;
  })
}));

vi.mock("ai", () => ({
  generateText: vi.fn(async () => ({
    text: "answer text",
    usage: { inputTokens: 10, outputTokens: 5 }
  })),
  embed: vi.fn(async () => ({
    embedding: Array.from({ length: 768 }, () => 0),
    usage: { tokens: 1 }
  }))
}));

beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "test-key");
});

describe("answer()", () => {
  it("calls gemini-2.5-flash with maxOutputTokens 600 and temperature 0.2", async () => {
    const { generateText } = await import("ai");
    const { answer } = await import("@/ai/gateway");
    const result = await answer({ prompt: "test prompt" });
    expect(result.text).toBe("answer text");
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({
      maxOutputTokens: 600,
      temperature: 0.2
    }));
  });
});

describe("embed()", () => {
  it("returns a 768-element embedding from gemini-embedding-001", async () => {
    const { embed: aiEmbed } = await import("ai");
    const { embed } = await import("@/ai/gateway");
    const result = await embed("query text");
    expect(result.length).toBe(768);
    expect(aiEmbed).toHaveBeenCalledWith(expect.objectContaining({
      value: "query text"
    }));
  });
});
