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
}

interface FakeReq {
  url: string;
  nextUrl: FakeNextUrl;
  cookies: FakeCookies;
}

function makeReq(
  pathname: string,
  opts: { cookieValue?: string; cookieName?: string } = {},
): FakeReq {
  const cookies: Record<string, string> = {};
  if (opts.cookieValue) {
    cookies[opts.cookieName ?? "authjs.session-token"] = opts.cookieValue;
  }
  return {
    url: `http://localhost:3000${pathname}`,
    nextUrl: { pathname },
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

  it("redirects to /login when decode throws (malformed/tampered JWT)", async () => {
    mocks.decodeFn.mockRejectedValue(new Error("malformed"));
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
});
