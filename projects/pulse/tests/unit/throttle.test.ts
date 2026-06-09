// tests/unit/throttle.test.ts
import { describe, it, expect, vi } from "vitest";
import { createThrottle, isRateLimited } from "../../lib/notion/throttle.js";

describe("isRateLimited", () => {
  it("detects rate-limit by code or status", () => {
    expect(isRateLimited({ code: "rate_limited" })).toBe(true);
    expect(isRateLimited({ status: 429 })).toBe(true);
    expect(isRateLimited({ status: 529 })).toBe(true);
    expect(isRateLimited({ status: 500 })).toBe(false);
  });
});

describe("createThrottle", () => {
  it("retries a rate-limited call then resolves", async () => {
    const sleep = vi.fn(async () => {});
    const throttle = createThrottle({ concurrency: 2, maxRetries: 3, sleep });
    let calls = 0;
    const result = await throttle(async () => {
      calls++;
      if (calls === 1) throw { status: 429, headers: { "retry-after": "1" } };
      return "ok";
    });
    expect(result).toBe("ok");
    expect(calls).toBe(2);
    expect(sleep).toHaveBeenCalledWith(1000); // honored Retry-After seconds → ms
  });

  it("gives up after maxRetries on persistent rate limiting", async () => {
    const throttle = createThrottle({ maxRetries: 2, sleep: async () => {} });
    await expect(throttle(async () => { throw { status: 429 }; })).rejects.toBeTruthy();
  });

  it("rethrows non-rate-limit errors immediately", async () => {
    const sleep = vi.fn(async () => {});
    const throttle = createThrottle({ maxRetries: 5, sleep });
    await expect(throttle(async () => { throw new Error("boom"); })).rejects.toThrow("boom");
    expect(sleep).not.toHaveBeenCalled();
  });
});
