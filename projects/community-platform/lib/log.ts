/**
 * Thin structured-logger wrapper around `console.warn` / `console.error`.
 *
 * Format: `[tag] event {...fields}` single-line, JSON-stringified fields.
 * Vercel logs auto-prepend timestamp + region; this layer is grep-friendly.
 *
 * O6 contract: callers must pass JSON-serializable fields (primitives,
 * plain objects, arrays). Circular refs / functions / symbols are caller
 * responsibility — pass `String(err)` not the Error object directly.
 *
 * H85: empty tag is rejected at runtime to prevent ambiguous log lines.
 *
 * Future pino swap: replace internals; preserve `log.warn` / `log.error`
 * signature so call-sites don't move.
 */
type LogFields = Readonly<Record<string, unknown>>;

function format(tag: string, event: string, fields?: LogFields): string {
  if (tag.length === 0) {
    throw new Error("log tag must be non-empty");
  }
  // Inline the guard to preserve TypeScript narrowing of `fields` in the
  // JSON.stringify branch — `const hasFields = ...` would break narrowing
  // through the boolean intermediate (caught by chat-33 ts-reviewer).
  return fields !== undefined && Object.keys(fields).length > 0
    ? `[${tag}] ${event} ${JSON.stringify(fields)}`
    : `[${tag}] ${event}`;
}

export const log = {
  warn(tag: string, event: string, fields?: LogFields): void {
    console.warn(format(tag, event, fields));
  },
  error(tag: string, event: string, fields?: LogFields): void {
    console.error(format(tag, event, fields));
  },
} as const;
