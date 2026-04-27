import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, _resetForTests } from "@/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    _resetForTests();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-26T10:00:00Z"));
  });

  it("allows up to the limit, denies after", () => {
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit({ userId: 1, key: "ask" });
      expect(r.allowed, `call ${i+1}`).toBe(true);
    }
    const r = checkRateLimit({ userId: 1, key: "ask" });
    expect(r.allowed).toBe(false);
    expect(r.retryAtIso).toBeDefined();
  });

  it("isolates users", () => {
    for (let i = 0; i < 10; i++) checkRateLimit({ userId: 1, key: "ask" });
    expect(checkRateLimit({ userId: 2, key: "ask" }).allowed).toBe(true);
  });

  it("decays the window", () => {
    for (let i = 0; i < 10; i++) checkRateLimit({ userId: 1, key: "ask" });
    expect(checkRateLimit({ userId: 1, key: "ask" }).allowed).toBe(false);
    vi.advanceTimersByTime(60 * 60 * 1000 + 1);
    expect(checkRateLimit({ userId: 1, key: "ask" }).allowed).toBe(true);
  });

  it("isolates command keys", () => {
    for (let i = 0; i < 10; i++) checkRateLimit({ userId: 1, key: "ask" });
    expect(checkRateLimit({ userId: 1, key: "ask" }).allowed).toBe(false);
    expect(checkRateLimit({ userId: 1, key: "search" }).allowed).toBe(true);
  });
});
