import { describe, expect, it, vi } from "vitest";
import { PERSONA_MAX_BYTES } from "@/lib/persona-editor";
import { fetchPersonaFromUrl, validatePersonaUrl } from "@/lib/persona-fetch";

const OK_RAW = "https://raw.githubusercontent.com/jane/personas/main/persona-jane-d.public.md";
const OK_GIST = "https://gist.githubusercontent.com/jane/abc123/raw/persona-jane-d.public.md";

interface FakeResponseInit {
  status?: number;
  type?: ResponseType;
  contentLength?: string;
  body?: ReadableStream<Uint8Array> | null;
}

// Plain-object fake: the implementation only touches .status/.type/.headers/.body,
// and the Response constructor can't produce type "opaqueredirect".
function fakeResponse(init: FakeResponseInit = {}): Response {
  const headers = new Headers();
  if (init.contentLength !== undefined) headers.set("content-length", init.contentLength);
  return {
    status: init.status ?? 200,
    type: init.type ?? "default",
    headers,
    body: init.body ?? null,
  } as unknown as Response;
}

function streamOf(
  chunks: readonly Uint8Array[],
  opts?: { neverClose?: boolean; onCancel?: () => void },
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(c);
      if (!opts?.neverClose) controller.close();
    },
    cancel() {
      opts?.onCancel?.();
    },
  });
}

function fetchReturning(res: Response): { impl: typeof fetch; spy: ReturnType<typeof vi.fn> } {
  const spy = vi.fn(async () => res);
  return { impl: spy as unknown as typeof fetch, spy };
}

describe("validatePersonaUrl (H151)", () => {
  it("accepts the raw.githubusercontent.com host", () => {
    expect(validatePersonaUrl(OK_RAW)?.hostname).toBe("raw.githubusercontent.com");
  });

  it("accepts the gist.githubusercontent.com host", () => {
    expect(validatePersonaUrl(OK_GIST)?.hostname).toBe("gist.githubusercontent.com");
  });

  it("rejects http:", () => {
    expect(validatePersonaUrl("http://raw.githubusercontent.com/x")).toBeNull();
  });

  it("rejects the userinfo trick (https://raw.githubusercontent.com@evil.com/…)", () => {
    // WHATWG parses this to username "raw.githubusercontent.com" + hostname "evil.com".
    expect(validatePersonaUrl("https://raw.githubusercontent.com@evil.com/x")).toBeNull();
  });

  it("rejects the lookalike host raw.githubusercontent.com.evil.com (exact-=== Set, never endsWith)", () => {
    expect(validatePersonaUrl("https://raw.githubusercontent.com.evil.com/x")).toBeNull();
  });

  it("rejects an explicit port", () => {
    expect(validatePersonaUrl("https://raw.githubusercontent.com:8443/x")).toBeNull();
  });

  it("rejects parse errors", () => {
    expect(validatePersonaUrl("not a url")).toBeNull();
  });
});

describe("fetchPersonaFromUrl (H151 + H152)", () => {
  it("invalid URL → invalid_url and fetchImpl is never invoked", async () => {
    const { impl, spy } = fetchReturning(fakeResponse());
    expect(await fetchPersonaFromUrl("https://evil.com/x", impl)).toEqual({
      ok: false,
      error: "invalid_url",
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it("redirect status 301 → fetch_failed (redirect: manual — any redirect rejects)", async () => {
    const { impl } = fetchReturning(fakeResponse({ status: 301 }));
    expect(await fetchPersonaFromUrl(OK_RAW, impl)).toEqual({ ok: false, error: "fetch_failed" });
  });

  it("opaqueredirect response type → fetch_failed", async () => {
    const { impl } = fetchReturning(fakeResponse({ status: 0, type: "opaqueredirect" }));
    expect(await fetchPersonaFromUrl(OK_RAW, impl)).toEqual({ ok: false, error: "fetch_failed" });
  });

  it("404 → fetch_failed", async () => {
    const { impl } = fetchReturning(fakeResponse({ status: 404 }));
    expect(await fetchPersonaFromUrl(OK_RAW, impl)).toEqual({ ok: false, error: "fetch_failed" });
  });

  it("network error (fetchImpl throws) → fetch_failed", async () => {
    const spy = vi.fn(async () => {
      throw new Error("boom");
    });
    expect(await fetchPersonaFromUrl(OK_RAW, spy as unknown as typeof fetch)).toEqual({
      ok: false,
      error: "fetch_failed",
    });
  });

  it("declared Content-Length > cap → fetch_too_large WITHOUT reading the body", async () => {
    // Plan-vs-runtime note: Node.js WHATWG ReadableStream fires `pull` as a
    // microtask during construction even with no reader acquired, so tracking
    // `pulled` cannot distinguish "pull() because reader exists" from "pull()
    // because Node initialized the stream". We use `cancel` instead: cancel
    // only fires when a reader is acquired AND then released/cancelled — it
    // proves no reader acquisition (= no body read) when false. Same spirit.
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      pull() {
        // intentionally empty — we're only tracking cancel, not pull
      },
      cancel() {
        cancelled = true;
      },
    });
    const { impl } = fetchReturning(
      fakeResponse({ contentLength: String(PERSONA_MAX_BYTES + 1), body }),
    );
    expect(await fetchPersonaFromUrl(OK_RAW, impl)).toEqual({ ok: false, error: "fetch_too_large" });
    expect(cancelled).toBe(false);
  });

  it("H152: body exceeding the cap mid-stream → fetch_too_large + stream cancelled (Content-Length absent)", async () => {
    let cancelled = false;
    // 40,000 + 30,000 = 70,000 bytes; the stream deliberately never closes —
    // a real over-cap origin keeps streaming; the implementation must cancel,
    // not wait for EOF (the test would hang on a non-cancelling implementation).
    const body = streamOf([new Uint8Array(40_000), new Uint8Array(30_000)], {
      neverClose: true,
      onCancel: () => {
        cancelled = true;
      },
    });
    const { impl } = fetchReturning(fakeResponse({ body }));
    expect(await fetchPersonaFromUrl(OK_RAW, impl)).toEqual({ ok: false, error: "fetch_too_large" });
    expect(cancelled).toBe(true);
  });

  it("accepts an exactly-64KB body", async () => {
    const bytes = new TextEncoder().encode("a".repeat(PERSONA_MAX_BYTES));
    const body = streamOf([bytes.slice(0, 30_000), bytes.slice(30_000)]);
    const { impl } = fetchReturning(fakeResponse({ body }));
    expect(await fetchPersonaFromUrl(OK_RAW, impl)).toEqual({
      ok: true,
      content: "a".repeat(PERSONA_MAX_BYTES),
    });
  });

  it("accepts a gist-host fetch and decodes UTF-8", async () => {
    const body = streamOf([new TextEncoder().encode("# Pérsona ✓")]);
    const { impl, spy } = fetchReturning(fakeResponse({ body }));
    expect(await fetchPersonaFromUrl(OK_GIST, impl)).toEqual({ ok: true, content: "# Pérsona ✓" });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("null body → ok with empty content (SavePersonaSchema.min(1) rejects downstream — H154 owns content gating)", async () => {
    const { impl } = fetchReturning(fakeResponse({ body: null }));
    expect(await fetchPersonaFromUrl(OK_RAW, impl)).toEqual({ ok: true, content: "" });
  });
});
