export interface BackoffOptions {
  readonly baseMs?: number;
  readonly capMs?: number;
  readonly rng?: () => number;
}

/**
 * Full-jitter exponential backoff (AWS Architecture Blog "Exponential
 * Backoff And Jitter"): sleep = random(0, min(cap, base·2^(attempt-1))).
 * `attempt` is 1-based. Full jitter is the recommended strategy under
 * optimistic-concurrency contention — it de-correlates retriers so the
 * shared-file CAS doesn't thrash (spec §21 H129).
 */
export function computeBackoffDelay(attempt: number, opts: BackoffOptions = {}): number {
  const base = opts.baseMs ?? 75;
  const cap = opts.capMs ?? 2000;
  const rng = opts.rng ?? Math.random;
  const ceiling = Math.min(cap, base * 2 ** (attempt - 1));
  return Math.floor(rng() * ceiling);
}
