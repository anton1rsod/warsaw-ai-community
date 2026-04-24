import { describe, it, expect, vi } from "vitest";
import { handleStatus } from "../../src/commands/status";

describe("handleStatus", () => {
  it("returns an opted-out message when prefs.optedOut is true", async () => {
    const prefs = {
      get: vi.fn(async () => ({ authorId: 99, optedOut: true, updatedAt: new Date() })),
      optOut: vi.fn(),
      optIn: vi.fn()
    };
    const res = await handleStatus({ authorId: 99, prefs: prefs as never });
    expect(res.optedOut).toBe(true);
    expect(res.message).toMatch(/opted out/i);
    expect(res.message).toMatch(/gbrain-optin/);
  });

  it("returns an opted-in message when prefs.optedOut is false", async () => {
    const prefs = {
      get: vi.fn(async () => ({ authorId: 99, optedOut: false, updatedAt: new Date() })),
      optOut: vi.fn(),
      optIn: vi.fn()
    };
    const res = await handleStatus({ authorId: 99, prefs: prefs as never });
    expect(res.optedOut).toBe(false);
    expect(res.message).toMatch(/opted in/i);
    expect(res.message).toMatch(/48h/);
  });
});
