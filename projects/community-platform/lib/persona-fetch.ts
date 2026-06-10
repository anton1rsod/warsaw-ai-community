import { PERSONA_MAX_BYTES } from "./persona-editor";

export type PersonaFetchError = "invalid_url" | "fetch_failed" | "fetch_too_large";

export interface PersonaFetchOk {
  ok: true;
  content: string;
}

export interface PersonaFetchErr {
  ok: false;
  error: PersonaFetchError;
}

/** Wall-clock budget for the whole fetch (connect + headers + body). */
const FETCH_TIMEOUT_MS = 10_000;

// H151: hostname allowlist — strict `===` Set membership, never
// startsWith/includes/endsWith/regex (the lookalike
// `raw.githubusercontent.com.evil.com` must fail exact match). The WHATWG
// parser lowercases + punycode-normalizes `hostname` before this compare.
const ALLOWED_HOSTS: ReadonlySet<string> = new Set([
  "raw.githubusercontent.com",
  "gist.githubusercontent.com",
]);

/**
 * H151: URL guard, OWASP-verified — run on EVERY fetch (attach AND re-sync;
 * stored URLs are untrusted on every read, see H153).
 *
 * Accepts only: https:, empty userinfo (defeats
 * `https://raw.githubusercontent.com@evil.com/…`, which parses to hostname
 * `evil.com`), empty port, hostname EXACTLY in the frozen allowlist.
 * Returns null on any parse failure.
 */
export function validatePersonaUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username !== "" || url.password !== "") return null;
  if (url.port !== "") return null;
  if (!ALLOWED_HOSTS.has(url.hostname)) return null;
  return url;
}

/**
 * Fetches persona markdown from a guarded URL.
 *
 * H151: validatePersonaUrl gates every call; `redirect: "manual"` rejects any
 * redirect (legitimate raw/gist URLs never redirect).
 * H152: declared Content-Length is advisory + origin-controlled — used only
 * for early rejection, never as the cap. The authoritative cap is a streamed
 * byte count that aborts + discards the moment it exceeds PERSONA_MAX_BYTES.
 *
 * `fetchImpl` is injectable for tests; defaults to the global fetch.
 */
export async function fetchPersonaFromUrl(
  raw: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PersonaFetchOk | PersonaFetchErr> {
  const url = validatePersonaUrl(raw);
  if (url === null) return { ok: false, error: "invalid_url" };

  let res: Response;
  try {
    res = await fetchImpl(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, error: "fetch_failed" };
  }

  // H151: any redirect (manual-mode 3xx status or browser opaqueredirect) and
  // any non-2xx status reject.
  if (res.type === "opaqueredirect" || res.status < 200 || res.status > 299) {
    return { ok: false, error: "fetch_failed" };
  }

  // H152: early-reject an oversized *declaration* without reading the body.
  const declared = res.headers.get("content-length");
  if (declared !== null) {
    const n = Number(declared);
    if (Number.isFinite(n) && n > PERSONA_MAX_BYTES) {
      return { ok: false, error: "fetch_too_large" };
    }
  }

  if (res.body === null) {
    // No body (origin quirk). Empty content fails SavePersonaSchema.min(1)
    // downstream — the single pipeline (H154) owns content gating.
    return { ok: true, content: "" };
  }

  // H152: byte-accurate streamed cap.
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    for (;;) {
      const result = await reader.read();
      if (result.done) break;
      const chunk = result.value;
      received += chunk.byteLength;
      if (received > PERSONA_MAX_BYTES) {
        // H152: abort + discard the moment the running count exceeds the cap.
        await reader.cancel().catch(() => undefined);
        return { ok: false, error: "fetch_too_large" };
      }
      chunks.push(chunk);
    }
  } catch {
    return { ok: false, error: "fetch_failed" };
  }

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, content: new TextDecoder("utf-8").decode(merged) };
}
