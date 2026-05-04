/**
 * Emit a YAML 1.2-compatible double-quoted scalar.
 *
 * Implementation: `JSON.stringify(v)` produces a valid YAML 1.2
 * double-quoted flow scalar — JSON's escape set (`\"`, `\\`, `\n`, `\r`,
 * `\t`, `\b`, `\f`, `\uXXXX`) is a subset of YAML 1.2's. Avoids the
 * YAML 1.1 implicit-typing footguns:
 *  - Bare `2026-04-24` parsed as timestamp.
 *  - Bare `yes`/`no`/`on`/`off`/`y`/`n` parsed as boolean.
 *  - Bare `null`/`Null`/`NULL`/`~` parsed as null.
 *  - Numeric-looking strings parsed as Number.
 *
 * Used by `lib/consent-content.ts:generateConsentMarkdown` and any
 * future YAML frontmatter emitter; see spec §11.5 H11.
 */
export function yamlString(v: string): string {
  return JSON.stringify(v);
}
