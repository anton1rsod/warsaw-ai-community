import { describe, it, expect } from "vitest";
import { computeBackoffDelay } from "@/lib/backoff";

describe("H129: computeBackoffDelay (full jitter)", () => {
  it("returns 0 when rng()=0", () => {
    expect(computeBackoffDelay(1, { rng: () => 0 })).toBe(0);
  });
  it("caps the exponential ceiling at capMs", () => {
    // attempt 10 with rng()=1 would be base*2^9 but is clamped to capMs.
    expect(computeBackoffDelay(10, { baseMs: 75, capMs: 2000, rng: () => 1 })).toBe(2000);
  });
  it("grows exponentially before the cap (rng()=1 returns the ceiling)", () => {
    expect(computeBackoffDelay(1, { baseMs: 75, capMs: 9999, rng: () => 1 })).toBe(75);
    expect(computeBackoffDelay(2, { baseMs: 75, capMs: 9999, rng: () => 1 })).toBe(150);
    expect(computeBackoffDelay(3, { baseMs: 75, capMs: 9999, rng: () => 1 })).toBe(300);
  });
  it("returns a value in [0, ceiling] for arbitrary rng", () => {
    const d = computeBackoffDelay(3, { baseMs: 75, capMs: 9999, rng: () => 0.5 });
    expect(d).toBeGreaterThanOrEqual(0);
    expect(d).toBeLessThanOrEqual(300);
  });
});
