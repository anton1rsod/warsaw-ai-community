import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/lib/auth";
import { POST } from "@/app/api/preview-markdown/route";

beforeEach(() => vi.clearAllMocks());

function jsonReq(body: unknown): Request {
  return new Request("http://test/api/preview-markdown", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function rawReq(body: string): Request {
  return new Request("http://test/api/preview-markdown", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("POST /api/preview-markdown", () => {
  it("returns 401 when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await POST(jsonReq({ body: "anything" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when JSON is malformed", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    const res = await POST(rawReq("not json{"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is missing or wrong shape", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    const res = await POST(jsonReq({ wrong: true }));
    expect(res.status).toBe(400);
  });

  it("returns sanitized HTML when authed + body is valid markdown", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    const res = await POST(jsonReq({ body: "# Hello\n\nWorld." }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { html: string };
    expect(json.html).toContain("<h1>");
    expect(json.html).toContain("Hello");
  });

  describe("H22: markdown link sanitization", () => {
    it("strips unsafe URL schemes from links in the rendered HTML", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      const malicious = "[click](javascript:alert('xss'))";
      const res = await POST(jsonReq({ body: malicious }));
      expect(res.status).toBe(200);
      const json = (await res.json()) as { html: string };
      expect(json.html.toLowerCase()).not.toContain("javascript:");
    });
  });
});
