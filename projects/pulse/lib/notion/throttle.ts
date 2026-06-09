import pLimit from "p-limit";

export type Throttle = <T>(fn: () => Promise<T>) => Promise<T>;

export interface ThrottleOptions {
  concurrency?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export function isRateLimited(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: unknown; status?: unknown };
  if (e.code === "rate_limited") return true;
  return e.status === 429 || e.status === 529;
}

function retryAfterMs(err: unknown, fallbackMs: number): number {
  const headers = (err as { headers?: Record<string, string> }).headers;
  const raw = headers?.["retry-after"];
  const secs = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(secs) ? secs * 1000 : fallbackMs;
}

export function createThrottle(opts: ThrottleOptions = {}): Throttle {
  const concurrency = opts.concurrency ?? 2;
  const maxRetries = opts.maxRetries ?? 5;
  const baseDelayMs = opts.baseDelayMs ?? 1000;
  const sleep = opts.sleep ?? defaultSleep;
  const limit = pLimit(concurrency);

  async function withBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    for (;;) {
      try {
        return await fn();
      } catch (err: unknown) {
        if (!isRateLimited(err) || attempt >= maxRetries) throw err;
        const expo = baseDelayMs * 2 ** attempt;
        await sleep(retryAfterMs(err, expo));
        attempt++;
      }
    }
  }

  return <T>(fn: () => Promise<T>): Promise<T> => limit(() => withBackoff(fn));
}
