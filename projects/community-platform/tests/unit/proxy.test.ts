import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authFn: vi.fn(),
  findMemberByHandleFn: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: mocks.authFn,
}));

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: mocks.findMemberByHandleFn,
}));

interface FakeNextUrl {
  pathname: string;
  clone(): { pathname: string };
}

function makeReq(pathname: string): {
  nextUrl: FakeNextUrl;
  url: string;
} {
  const cloned = { pathname };
  return {
    url: `http://localhost:3000${pathname}`,
    nextUrl: {
      pathname,
      clone: () => cloned,
    },
  };
}

describe("proxy", () => {
  beforeEach(() => {
    mocks.authFn.mockReset();
    mocks.findMemberByHandleFn.mockReset();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("passes through /login (public path)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/login");
    const res = await proxy(req as never);
    // NextResponse.next() returns a response without redirect headers
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.authFn).not.toHaveBeenCalled();
  });

  it("passes through /no-access (public path)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/no-access");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.authFn).not.toHaveBeenCalled();
  });

  it("passes through /api/auth/* (public prefix)", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/api/auth/callback/github");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toBeNull();
    expect(mocks.authFn).not.toHaveBeenCalled();
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

  it("redirects unauthenticated visit to /login", async () => {
    mocks.authFn.mockResolvedValue(null);
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home");
    const res = await proxy(req as never);
    // NextResponse.redirect produces a 307/308 with location header
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toMatch(/\/login$/);
  });

  it("redirects authenticated-but-not-on-roster handle to /no-access", async () => {
    mocks.authFn.mockResolvedValue({ githubHandle: "stranger" });
    mocks.findMemberByHandleFn.mockReturnValue(undefined);
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home");
    const res = await proxy(req as never);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toMatch(/\/no-access$/);
    expect(mocks.findMemberByHandleFn).toHaveBeenCalledWith("stranger");
  });

  it("allows authenticated roster member through", async () => {
    mocks.authFn.mockResolvedValue({ githubHandle: "anton1rsod" });
    mocks.findMemberByHandleFn.mockReturnValue({
      name: "Anton Safronov",
      githubHandle: "anton1rsod",
      slug: "anton-safronov",
    });
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home");
    const res = await proxy(req as never);
    // pass-through: no redirect location
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects authenticated session with no githubHandle to /login", async () => {
    mocks.authFn.mockResolvedValue({});
    const { default: proxy } = await import("@/proxy");
    const req = makeReq("/home");
    const res = await proxy(req as never);
    expect(res.headers.get("location")).toMatch(/\/login$/);
  });

  it("config.matcher excludes static assets", async () => {
    const { config } = await import("@/proxy");
    expect(config.matcher).toEqual([
      "/((?!_next/static|_next/image|favicon.ico).*)",
    ]);
  });
});
