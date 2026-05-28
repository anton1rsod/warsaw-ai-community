/**
 * v0.10.0 Phase C — One-line shipping-log primitive.
 *
 * Exposes the mode enum (`rich` | `shipping-log`), the per-mode body cap
 * constants, the H116 sanitize helper, and the H117 parse-mode validator.
 */

export const STATUS_MODES = ["rich", "shipping-log"] as const;
export type StatusMode = (typeof STATUS_MODES)[number];

export const STATUS_BODY_MAX_RICH = 4000;
export const STATUS_BODY_MAX_SHIPPING_LOG = 280;

/**
 * H116 — strip characters that could enable HTML or Markdown injection
 * in a context that renders the body without further escaping. Applies
 * to shipping-log mode only; rich mode keeps Markdown intact (its
 * sanitization is handled downstream by the existing renderer).
 *
 * - `<` and `>` removed (HTML tags)
 * - Markdown control chars `*`, `` ` ``, `#`, `_`, `~` removed
 * - Trailing whitespace collapsed
 */
export function sanitizeShippingLogBody(input: string): string {
  return input.replace(/[<>*`#_~]/g, "").replace(/[ \t]+/g, " ").replace(/\s+$/, "").trimStart();
}

/**
 * H117 — narrow an unknown mode value (frontmatter, action input) into
 * the closed `StatusMode` union. Throws on unknown values at write time;
 * read-time callers should catch and default to `"rich"` for forward-
 * compatibility with future modes.
 */
export function parseStatusMode(raw: unknown): StatusMode {
  if (raw === undefined) return "rich";
  if (typeof raw !== "string") {
    throw new Error(`unknown status mode (not a string): ${JSON.stringify(raw)}`);
  }
  if (raw === "rich" || raw === "shipping-log") return raw;
  throw new Error(`unknown status mode: ${JSON.stringify(raw)}`);
}
