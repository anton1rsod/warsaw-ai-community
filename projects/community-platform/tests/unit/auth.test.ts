import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Auth-config tests need real env values for the lib/env Zod schema to load.
// Mirror the pattern from tests/unit/env.test.ts.

describe("authConfig", () => {
  const originalEnv = { ...process.env };
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXTAUTH_SECRET = "test-secret-32-bytes-long-aaaaaaa";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.NEXTAUTH_SESSION_MAX_AGE = "2592000";
    process.env.GITHUB_OAUTH_CLIENT_ID = "client-id";
    process.env.GITHUB_OAUTH_CLIENT_SECRET = "client-secret";
    process.env.GITHUB_APP_ID = "12345";
    process.env.GITHUB_APP_PRIVATE_KEY =
      "-----BEGIN RSA PRIVATE KEY-----\nfoo\n-----END RSA PRIVATE KEY-----";
    process.env.GITHUB_APP_INSTALLATION_ID = "67890";
    process.env.GITHUB_REPO_OWNER = "warsaw-ai-community";
    process.env.GITHUB_REPO_NAME = "warsaw-ai-community";
    process.env.GITHUB_REPO_BRANCH = "main";
    process.env.COMMUNITY_NAME = "Warsaw AI Community";
    process.env.COMMUNITY_SLUG = "warsaw-ai";
  });
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses JWT session strategy", async () => {
    const { authConfig } = await import("@/lib/auth");
    expect(authConfig.session?.strategy).toBe("jwt");
  });

  it("session.maxAge sourced from env", async () => {
    const { authConfig } = await import("@/lib/auth");
    expect(authConfig.session?.maxAge).toBe(2_592_000);
  });

  it("includes a GitHub provider", async () => {
    const { authConfig } = await import("@/lib/auth");
    expect(authConfig.providers.length).toBeGreaterThan(0);
  });

  it("declares /login as the signIn page", async () => {
    const { authConfig } = await import("@/lib/auth");
    expect(authConfig.pages?.signIn).toBe("/login");
  });

  it("jwt callback writes lowercase githubHandle into the token from GitHub profile login", async () => {
    const { authConfig } = await import("@/lib/auth");
    const cb = authConfig.callbacks?.jwt;
    if (!cb) throw new Error("jwt callback missing");
    const result = await cb({
      // Cast to never to bypass Auth.js's strict callback param types — values
      // we don't care about for the unit test. If beta.31's types differ
      // such that this no longer compiles, adapt the casts (see brief).
      token: {} as never,
      account: { provider: "github" } as never,
      profile: { login: "Octocat", id: 42 } as never,
      user: undefined as never,
      trigger: "signIn" as never,
      isNewUser: false,
      session: undefined,
    });
    expect((result as { githubHandle?: string }).githubHandle).toBe("octocat");
  });

  it("jwt callback leaves the token alone when account is not github", async () => {
    const { authConfig } = await import("@/lib/auth");
    const cb = authConfig.callbacks?.jwt;
    if (!cb) throw new Error("jwt callback missing");
    const result = await cb({
      token: { existing: "kept" } as never,
      account: { provider: "twitter" } as never,
      profile: { login: "ignored" } as never,
      user: undefined as never,
      trigger: "signIn" as never,
      isNewUser: false,
      session: undefined,
    });
    expect((result as Record<string, unknown>).githubHandle).toBeUndefined();
    expect((result as Record<string, unknown>).existing).toBe("kept");
  });

  it("jwt callback ignores profile without a login field", async () => {
    const { authConfig } = await import("@/lib/auth");
    const cb = authConfig.callbacks?.jwt;
    if (!cb) throw new Error("jwt callback missing");
    const result = await cb({
      token: {} as never,
      account: { provider: "github" } as never,
      profile: { id: 42 } as never, // no login field
      user: undefined as never,
      trigger: "signIn" as never,
      isNewUser: false,
      session: undefined,
    });
    expect((result as Record<string, unknown>).githubHandle).toBeUndefined();
  });

  it("session callback exposes githubHandle from token to session", async () => {
    const { authConfig } = await import("@/lib/auth");
    const cb = authConfig.callbacks?.session;
    if (!cb) throw new Error("session callback missing");
    const result = await cb({
      session: { user: { name: "X" }, expires: "2099-01-01" } as never,
      token: { githubHandle: "octocat" } as never,
      user: undefined as never,
      trigger: "update" as never,
      newSession: undefined,
    });
    expect((result as { githubHandle?: string }).githubHandle).toBe("octocat");
  });

  it("session callback leaves session alone when token has no githubHandle", async () => {
    const { authConfig } = await import("@/lib/auth");
    const cb = authConfig.callbacks?.session;
    if (!cb) throw new Error("session callback missing");
    const result = await cb({
      session: { user: { name: "X" }, expires: "2099-01-01" } as never,
      token: {} as never,
      user: undefined as never,
      trigger: "update" as never,
      newSession: undefined,
    });
    // beta.31 session return type doesn't extend Record<string,unknown> directly
    expect(
      (result as unknown as Record<string, unknown>).githubHandle,
    ).toBeUndefined();
  });
});
