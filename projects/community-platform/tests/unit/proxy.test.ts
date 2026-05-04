import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  decodeFn: vi.fn(),
  findMemberByHandleFn: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  decode: mocks.decodeFn,
}));

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: mocks.findMemberByHandleFn,
}));

interface FakeCookies {
  get: (name: string) => { value: string } | undefined;
}

interface FakeNextUrl {
  pathname: string;
  searchParams: URLSearchParams;
}

interface FakeReq {
  url: string;
  nextUrl: FakeNextUrl;
  cookies: FakeCookies;
}

function makeReq(
  pathname: string,
  opts: {
    cookieValue?: string;
    cookieName?: string;
    consented?: boolean;
    search?: string;
  } = {},
): FakeReq {
  const cookies: Record<string, string> = {};
  if (opts.cookieValue) {
    cookies[opts.cookieName ?? "authjs.session-token"] = opts.cookieValue;
  }
  // Default to consented = true for the existing tests; the tests that
  // exercise the consent gate explicitly opt out by passing
  // `consented: false`.
  if (opts.consented !== false) {
    cookies["waic-consented"] = "1";
  }
  const searchParams = new URLSearchParams(opts.search ?? "");
  const url = `http://localhost:3000${pathname}${
    opts.search ? `?${opts.search}` : ""
  }`;
  return {
    url,
    nextUrl: { pathname, searchParams },
    cookies: {
      get: (name: string) => {
        const v = cookies[name];
        return v !== undefined ? { value: v } : undefined;
      },
    },
  };
}

describe("proxy", () => {
  const originalSecret = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    mocks.decodeFn.mockReset();
    mocks.findMemberByHandleFn.mockReset();
    process.env.NEXTAUTH_SECRET = "test-secret-32-bytes-long-aaaaaaa";
  });

  afterEach(() => {
    vi.resetModules();
    if (originalSecret === undefined) {
      delete process.env.NEXTAUTH_SECRET;
    } else {
      process.env.NEXTAUTH_SECRET = originalSecret;
    }
  });

  it("passes through /login (public path)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/login");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.decodeFn).not.toHaveBeenCalled();
  });

  it("passes through /no-access (public path)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/no-access");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.decodeFn).not.toHaveBeenCalled();
  });

  it("passes through /api/test-auth (dev-only session-forging route)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/api/test-auth");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.decodeFn).not.toHaveBeenCalled();
  });

  it("passes through /api/test-reset-status (dev/E2E mock-store reset)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/api/test-reset-status");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.decodeFn).not.toHaveBeenCalled();
  });

  it("allows /api/test-reset-invitations in dev (PUBLIC_PATHS)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/api/test-reset-invitations");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.decodeFn).not.toHaveBeenCalled();
  });

  it("allows /api/test-mint-expired in dev (PUBLIC_PATHS)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/api/test-mint-expired");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.decodeFn).not.toHaveBeenCalled();
  });

  it("passes through /api/auth/* (public prefix)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/api/auth/callback/github");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.decodeFn).not.toHaveBeenCalled();
  });

  it("passes through /_next/* (public prefix)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/_next/static/chunk.js");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
  });

  it("passes through /favicon* (public prefix)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/favicon.ico");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects to /login when no session cookie present", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home");
    const res = await proxy(req as never);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toMatch(/\/login$/);
    expect(mocks.decodeFn).not.toHaveBeenCalled();
  });

  it("redirects to /login when NEXTAUTH_SECRET is missing", async () => {
    delete process.env.NEXTAUTH_SECRET;
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home", { cookieValue: "any.jwt.value" });
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toMatch(/\/login$/);
    expect(mocks.decodeFn).not.toHaveBeenCalled();
  });

  it("redirects to /login when decode throws an Error (malformed/tampered JWT)", async () => {
    mocks.decodeFn.mockRejectedValue(new Error("malformed"));
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home", { cookieValue: "garbage" });
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toMatch(/\/login$/);
  });

  it("redirects to /login when decode rejects with a non-Error value", async () => {
    // Defensive coverage for the `err instanceof Error ? err.message : String(err)`
    // branch in proxy.ts catch — a non-Error throw (string, object, etc.)
    // should still result in a /login redirect, not an unhandled exception.
    mocks.decodeFn.mockRejectedValue("string-not-an-Error");
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home", { cookieValue: "garbage" });
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toMatch(/\/login$/);
  });

  it("redirects to /login when decode returns null", async () => {
    mocks.decodeFn.mockResolvedValue(null);
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home", { cookieValue: "expired.jwt" });
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toMatch(/\/login$/);
  });

  it("redirects to /login when decoded payload has no githubHandle", async () => {
    mocks.decodeFn.mockResolvedValue({ sub: "user-123" });
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home", { cookieValue: "valid.jwt" });
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toMatch(/\/login$/);
  });

  it("redirects to /no-access when handle is not on the roster", async () => {
    mocks.decodeFn.mockResolvedValue({ githubHandle: "stranger" });
    mocks.findMemberByHandleFn.mockReturnValue(undefined);
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home", { cookieValue: "valid.jwt" });
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toMatch(/\/no-access$/);
    expect(mocks.findMemberByHandleFn).toHaveBeenCalledWith("stranger");
  });

  it("allows roster member through", async () => {
    mocks.decodeFn.mockResolvedValue({ githubHandle: "anton1rsod" });
    mocks.findMemberByHandleFn.mockReturnValue({
      name: "Anton Safronov",
      githubHandle: "anton1rsod",
      slug: "anton-safronov",
    });
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home", { cookieValue: "valid.jwt" });
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
  });

  it("prefers __Secure- cookie when present (HTTPS environment)", async () => {
    mocks.decodeFn.mockResolvedValue({ githubHandle: "anton1rsod" });
    mocks.findMemberByHandleFn.mockReturnValue({
      name: "Anton Safronov",
      githubHandle: "anton1rsod",
      slug: "anton-safronov",
    });
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home", {
      cookieValue: "valid.jwt",
      cookieName: "__Secure-authjs.session-token",
    });
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.decodeFn).toHaveBeenCalledWith(
      expect.objectContaining({ salt: "__Secure-authjs.session-token" }),
    );
  });

  it("config.matcher excludes static assets", async () => {
    const { config } = await import("@/proxy");
    expect(config.matcher).toEqual([
      "/((?!_next/static|_next/image|favicon.ico).*)",
    ]);
  });

  describe("consent gate", () => {
    beforeEach(() => {
      mocks.decodeFn.mockResolvedValue({ githubHandle: "anton1rsod" });
      mocks.findMemberByHandleFn.mockReturnValue({
        name: "Anton Safronov",
        githubHandle: "anton1rsod",
        slug: "anton-safronov",
      });
    });

    it("redirects authenticated roster member to /consent when consent cookie missing", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/home", {
        cookieValue: "valid.jwt",
        consented: false,
      });
      const res = await proxy(req as never);
      expect(res.headers.get("location")).toMatch(/\/consent$/);
    });

    it("admits roster member with consent cookie", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/home", {
        cookieValue: "valid.jwt",
        consented: true,
      });
      const res = await proxy(req as never);
      expect(res.headers.get("location")).toBeNull();
    });

    it("passes through /consent without auth (it's the entry point)", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/consent");
      const res = await proxy(req as never);
      expect(res.headers.get("location")).toBeNull();
      expect(mocks.decodeFn).not.toHaveBeenCalled();
    });

    it("redirects unauthenticated /home visit to /login (not /consent)", async () => {
      // Auth check must precede consent check — an unauthenticated
      // user shouldn't see the consent page first.
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/home", { consented: false });
      const res = await proxy(req as never);
      expect(res.headers.get("location")).toMatch(/\/login$/);
    });
  });

  describe("PUBLIC_PATHS shape under NODE_ENV", () => {
    it("omits dev-only test routes from PUBLIC_PATHS in production builds", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.resetModules();
      const { default: proxy } = await import("@/proxy");
      // /api/test-auth is dev-only — in production the proxy redirects
      // to /login (and the route handler returns 404 anyway).
      const req = makeReq("/api/test-auth");
      const res = await proxy(req as never);
      expect(res.headers.get("location")).toMatch(/\/login$/);
      vi.unstubAllEnvs();
    });
  });

  describe("/onboard PUBLIC_PATHS additions", () => {
    it("allows /onboard without auth (PUBLIC_PATHS)", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard");
      const res = await proxy(req as never);
      // PUBLIC_PATHS hits return NextResponse.next() — no Location header.
      expect(res.headers.get("location")).toBeNull();
      expect(mocks.decodeFn).not.toHaveBeenCalled();
    });

    it("allows /onboard/error without auth", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard/error");
      const res = await proxy(req as never);
      expect(res.headers.get("location")).toBeNull();
      expect(mocks.decodeFn).not.toHaveBeenCalled();
    });

    it("does NOT make /admin/invite public — auth-gated (page-level admin gate runs after auth)", async () => {
      // No cookie → proxy redirects to /login
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/admin/invite");
      const res = await proxy(req as never);
      expect(res.headers.get("location")).toMatch(/\/login$/);
    });

    it("/onboard is public in production builds too", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.resetModules();
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard");
      const res = await proxy(req as never);
      expect(res.headers.get("location")).toBeNull();
      vi.unstubAllEnvs();
    });
  });

  describe("H4: Referrer-Policy + X-Frame-Options + Cache-Control on /onboard*", () => {
    it("sets Referrer-Policy: no-referrer on /onboard", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard");
      const res = await proxy(req as never);
      expect(res.headers.get("referrer-policy")).toBe("no-referrer");
    });

    it("sets X-Frame-Options: DENY on /onboard", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard");
      const res = await proxy(req as never);
      expect(res.headers.get("x-frame-options")).toBe("DENY");
    });

    it("sets Cache-Control: no-store on /onboard", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard");
      const res = await proxy(req as never);
      expect(res.headers.get("cache-control")).toBe("no-store");
    });

    it("sets H4 headers on /onboard/error too", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard/error");
      const res = await proxy(req as never);
      expect(res.headers.get("referrer-policy")).toBe("no-referrer");
      expect(res.headers.get("x-frame-options")).toBe("DENY");
      expect(res.headers.get("cache-control")).toBe("no-store");
    });

    it("does NOT set H4 headers on other public paths (e.g., /login)", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/login");
      const res = await proxy(req as never);
      expect(res.headers.get("referrer-policy")).toBeNull();
      expect(res.headers.get("x-frame-options")).toBeNull();
    });
  });

  describe("H5: /onboard?token=… handoff in proxy", () => {
    // The proxy verifies the token's HMAC, sets the
    // __Secure-warsaw_invite cookie, and 302-redirects to the clean
    // /onboard URL. This pattern compensates for Next.js Server
    // Components not being able to call cookies().set().
    const SECRET = "x".repeat(32);

    beforeEach(() => {
      process.env.INVITE_SECRET = SECRET;
    });

    afterEach(() => {
      delete process.env.INVITE_SECRET;
    });

    async function mintValid(): Promise<string> {
      const { mintToken } = await import("@/lib/invitations");
      return mintToken(
        {
          jti: "11111111-2222-4333-8444-555555555555",
          iss: "anton1rsod",
          exp: Math.floor(Date.now() / 1000) + 7 * 86400,
        },
        SECRET,
      );
    }

    it("redirects to clean /onboard and sets the invite cookie when token verifies", async () => {
      const token = await mintValid();
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard", { search: `token=${token}` });
      const res = await proxy(req as never);
      expect(res.headers.get("location")).toMatch(/\/onboard$/);
      const setCookie = res.headers.get("set-cookie") ?? "";
      // Dev/test: plain `warsaw_invite`. Production: `__Secure-warsaw_invite`
      // (browser-enforced — see lib/invitations.ts:INVITE_COOKIE_NAME).
      expect(setCookie).toMatch(/(__Secure-)?warsaw_invite=/);
      expect(setCookie).toContain("HttpOnly");
      expect(setCookie).toContain("SameSite=strict");
      expect(setCookie).toContain("Path=/onboard");
    });

    it("applies H4 headers on the redirect response (no Referer leak on the 302)", async () => {
      const token = await mintValid();
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard", { search: `token=${token}` });
      const res = await proxy(req as never);
      expect(res.headers.get("referrer-policy")).toBe("no-referrer");
    });

    it("falls through (no redirect, no cookie) when token signature is invalid", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard", { search: "token=garbage.notvalid" });
      const res = await proxy(req as never);
      // Falls through to PUBLIC_PATHS branch — sets H4 headers, no
      // location redirect, no cookie.
      expect(res.headers.get("location")).toBeNull();
      expect(res.headers.get("set-cookie")).toBeNull();
    });

    it("falls through when INVITE_SECRET is unset (defence-in-depth)", async () => {
      delete process.env.INVITE_SECRET;
      const token = await mintValid();
      // re-set so mintValid's import doesn't throw, then delete again
      delete process.env.INVITE_SECRET;
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard", { search: `token=${token}` });
      const res = await proxy(req as never);
      expect(res.headers.get("location")).toBeNull();
    });

    it("does not run the handoff when /onboard is requested without a token", async () => {
      const { default: proxy } = await import("@/proxy");
      const req = makeReq("/onboard");
      const res = await proxy(req as never);
      // Plain /onboard hit — no redirect, just headers.
      expect(res.headers.get("location")).toBeNull();
      expect(res.headers.get("set-cookie")).toBeNull();
    });
  });
});
