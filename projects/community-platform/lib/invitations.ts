/**
 * Canonical JSON serialization for HMAC payload signing.
 *
 * Properties: alphabetically-sorted keys at every depth; `undefined`
 * values omitted; explicit `null` preserved; no whitespace. The same
 * function is called on the SIGN side and the VERIFY side so that
 * payload key order at construction time has no effect on the HMAC.
 *
 * Used by mintToken (Task 11.1.5) + verifyToken (Task 11.1.5).
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, sortKeys);
}

function sortKeys(_key: string, val: unknown): unknown {
  if (
    val === null ||
    typeof val !== "object" ||
    Array.isArray(val)
  ) {
    return val;
  }
  const obj = val as Record<string, unknown>;
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      const v = obj[k];
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {});
}
