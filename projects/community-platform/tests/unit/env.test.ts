import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("env", () => {
  const originalEnv = { ...process.env };
  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { process.env = { ...originalEnv }; });

  function setRequiredEnv(): void {
    process.env.NEXTAUTH_SECRET = "test-secret-32-bytes-long-aaaaaaa";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.GITHUB_OAUTH_CLIENT_ID = "client-id";
    process.env.GITHUB_OAUTH_CLIENT_SECRET = "client-secret";
    process.env.GITHUB_APP_ID = "12345";
    process.env.GITHUB_APP_PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\nfoo\n-----END RSA PRIVATE KEY-----";
    process.env.GITHUB_APP_INSTALLATION_ID = "67890";
    process.env.GITHUB_REPO_OWNER = "warsaw-ai-community";
    process.env.GITHUB_REPO_NAME = "warsaw-ai-community";
    process.env.GITHUB_REPO_BRANCH = "main";
    process.env.COMMUNITY_NAME = "Warsaw AI Community";
    process.env.COMMUNITY_SLUG = "warsaw-ai";
    process.env.INVITE_SECRET = "x".repeat(32);
  }

  it("returns parsed values when all required vars set", async () => {
    setRequiredEnv();
    const { env } = await import("@/lib/env");
    expect(env.GITHUB_REPO_OWNER).toBe("warsaw-ai-community");
    expect(env.COMMUNITY_NAME).toBe("Warsaw AI Community");
    expect(env.NEXTAUTH_SESSION_MAX_AGE).toBe(2_592_000);
    expect(env.INVITE_SECRET).toBe("x".repeat(32));
  });

  it("throws when a required var is missing", async () => {
    delete process.env.NEXTAUTH_SECRET;
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    await expect(import("@/lib/env")).rejects.toThrow(/NEXTAUTH_SECRET/);
  });

  it("throws when INVITE_SECRET is missing", async () => {
    setRequiredEnv();
    delete process.env.INVITE_SECRET;
    await expect(import("@/lib/env")).rejects.toThrow(/INVITE_SECRET/);
  });

  it("throws when INVITE_SECRET is shorter than 32 chars", async () => {
    setRequiredEnv();
    process.env.INVITE_SECRET = "tooshort";
    await expect(import("@/lib/env")).rejects.toThrow(/INVITE_SECRET/);
  });
});
