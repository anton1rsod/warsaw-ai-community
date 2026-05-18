/**
 * v0.4 Phase A.0.5 — proxy.ts PUBLIC_PATHS extension (/, /calendar, /handbook).
 *
 * Asserts the anonymous behavior at each surface: NextResponse.next() (200
 * for the page handler downstream) instead of NextResponse.redirect("/login").
 *
 * The proxy function calls findMemberByHandle via content-snapshot import; we
 * don't need to mock it here since the no-cookie path never reaches that
 * code branch (PUBLIC_PATHS short-circuits at line 194 of proxy.ts).
 */
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import proxy from "@/proxy";

function req(path: string): NextRequest {
  return new NextRequest(new URL(path, "https://example.test"));
}

describe("proxy.ts — v0.4 PUBLIC_PATHS additions", () => {
  it("/ is anonymous-public (ADR-0014)", async () => {
    const res = await proxy(req("/"));
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("/calendar is anonymous-public (D27)", async () => {
    const res = await proxy(req("/calendar"));
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("/handbook is anonymous-public (D26 + Q6.1 (i))", async () => {
    const res = await proxy(req("/handbook"));
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("preserves v0.3 gated paths (no leak from the diff)", async () => {
    for (const gated of ["/projects", "/members", "/decisions", "/me/edit"]) {
      const res = await proxy(req(gated));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toMatch(/\/login$/);
    }
  });

  it("preserves v0.3 anon-public paths from ADR-0012", async () => {
    for (const open of ["/home", "/events", "/meetings", "/api/calendar.ics", "/manifest.json"]) {
      const res = await proxy(req(open));
      expect(res.status).toBe(200);
    }
  });
});
