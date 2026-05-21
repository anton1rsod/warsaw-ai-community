/**
 * Normalize a GitHub username for safe use in commit messages, file paths,
 * and Co-Authored-By trailers.
 *
 * Operations (in order):
 *   1. Strip carriage returns and line feeds (defense-in-depth against
 *      session payload manipulation).
 *   2. Cap at 39 characters (GitHub's structural username limit).
 *   3. Throw if the stripped result is empty (every consumer has a known-
 *      valid handle from session/RSVP payload; silent empty produces
 *      malformed commits like `chore(events): @ created "slug"`).
 *
 * @throws Error("empty handle") when input is empty after CRLF strip.
 */
export function safeHandle(input: string): string {
  const stripped = input.replace(/[\r\n]/g, "");
  if (stripped.length === 0) {
    throw new Error("empty handle");
  }
  return stripped.slice(0, 39);
}
