import { describe, it, expect, vi } from "vitest";
import { handleOptOut, handleOptIn } from "../../src/commands/optout";

describe("handleOptOut / handleOptIn", () => {
  it("opts out when invoked", async () => {
    const prefs = {
      optOut: vi.fn(async () => {}),
      optIn: vi.fn(async () => {}),
      get: vi.fn()
    };
    const res = await handleOptOut({ authorId: 99, prefs: prefs as never });
    expect(res.ok).toBe(true);
    expect(prefs.optOut).toHaveBeenCalledWith(99);
  });

  it("opts in when invoked", async () => {
    const prefs = {
      optOut: vi.fn(),
      optIn: vi.fn(async () => {}),
      get: vi.fn()
    };
    const res = await handleOptIn({ authorId: 99, prefs: prefs as never });
    expect(res.ok).toBe(true);
    expect(prefs.optIn).toHaveBeenCalledWith(99);
  });
});
