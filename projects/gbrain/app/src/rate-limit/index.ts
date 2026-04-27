import type { RateLimitKey } from "../help/registry";

const LIMITS: Record<RateLimitKey, { count: number; windowMs: number }> = {
  ask: { count: 10, windowMs: 60 * 60 * 1000 },
  search: { count: 30, windowMs: 60 * 60 * 1000 }
};

const buckets = new Map<string, number[]>();

export interface RateLimitInput {
  userId: number;
  key: RateLimitKey;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAtIso?: string;
}

/**
 * Sliding-window per-user rate limit.
 * In-memory; per-region; not distributed (acceptable for staging + 0.1.x).
 * Per spec §4.5.
 */
export function checkRateLimit(input: RateLimitInput): RateLimitResult {
  const { userId, key } = input;
  const limit = LIMITS[key];
  const bucketKey = `${userId}:${key}`;
  const now = Date.now();
  const cutoff = now - limit.windowMs;

  let bucket = buckets.get(bucketKey);
  if (!bucket) {
    bucket = [];
    buckets.set(bucketKey, bucket);
  }
  while (bucket.length > 0 && (bucket[0] ?? 0) < cutoff) {
    bucket.shift();
  }

  if (bucket.length >= limit.count) {
    const oldest = bucket[0] ?? now;
    const retryAtMs = oldest + limit.windowMs;
    return { allowed: false, retryAtIso: new Date(retryAtMs).toISOString() };
  }

  bucket.push(now);
  return { allowed: true };
}

export function _resetForTests(): void {
  buckets.clear();
}
