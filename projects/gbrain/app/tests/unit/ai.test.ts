import { describe, it, expect, vi, beforeEach } from "vitest";

// gateway.ts validates GEMINI_API_KEY lazily via getGoogle(); set a stub before
// any import of the module under test.
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "test-only-not-a-real-key";

const mockGenerateText = vi.fn();
vi.mock("ai", () => ({ generateText: (...args: unknown[]) => mockGenerateText(...args) }));

// 0.1.1: provider switched from Vercel AI Gateway (string-routed model id) to
// direct @ai-sdk/google. We mock the provider factory so the test asserts on
// the model-id string we pass through, not the provider object.
const mockProvider = vi.fn((id: string) => ({ __provider: "google", modelId: id }));
vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: () => mockProvider
}));

beforeEach(() => {
  mockGenerateText.mockReset();
  mockProvider.mockClear();
});

describe("ai.summarise", () => {
  it("invokes the Google provider with the requested model id and forwards usage", async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: "summary",
      usage: { inputTokens: 120, outputTokens: 60 }
    });
    const { summarise } = await import("../../src/ai/index");
    const result = await summarise({
      model: "gemini-2.5-flash",
      prompt: "hi",
      maxOutputTokens: 500
    });
    expect(result.text).toBe("summary");
    expect(result.usage.inputTokens).toBe(120);
    expect(result.usage.outputTokens).toBe(60);
    expect(result.model).toBe("gemini-2.5-flash");
    expect(mockProvider).toHaveBeenCalledWith("gemini-2.5-flash");
    const arg = mockGenerateText.mock.calls[0]?.[0] as
      | { model: { modelId: string }; prompt: string; maxOutputTokens: number }
      | undefined;
    expect(arg).toBeDefined();
    expect(arg!.model.modelId).toBe("gemini-2.5-flash");
    expect(arg!.prompt).toBe("hi");
    expect(arg!.maxOutputTokens).toBe(500);
  });
});
