import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateText = vi.fn();
vi.mock("ai", () => ({ generateText: (...args: unknown[]) => mockGenerateText(...args) }));

beforeEach(() => mockGenerateText.mockReset());

describe("ai.summarise", () => {
  it("calls generateText with the requested model and prompt, returns text + usage", async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: "summary",
      usage: { inputTokens: 120, outputTokens: 60 }
    });
    const { summarise } = await import("../../src/ai/index");
    const result = await summarise({
      model: "google/gemini-2.0-flash",
      prompt: "hi",
      maxOutputTokens: 500
    });
    expect(result.text).toBe("summary");
    expect(result.usage.inputTokens).toBe(120);
    expect(result.usage.outputTokens).toBe(60);
    expect(result.model).toBe("google/gemini-2.0-flash");
    const arg = mockGenerateText.mock.calls[0]?.[0] as
      | { model: string; prompt: string; maxOutputTokens: number }
      | undefined;
    expect(arg).toBeDefined();
    expect(arg!.model).toBe("google/gemini-2.0-flash");
    expect(arg!.prompt).toBe("hi");
    expect(arg!.maxOutputTokens).toBe(500);
  });
});
