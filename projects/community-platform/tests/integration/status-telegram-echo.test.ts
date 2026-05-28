/**
 * D.5 — Integration test: postStatus → notifyTelegram opt-in flow.
 *
 * Validates H118 (echo gated on telegramEcho: true) and H121 (fresh
 * profile fetch used, not stale snapshot). Uses unit-level wiring per
 * the plan D.5 implementer note: vi.mock at the module boundary is
 * sufficient to lock the invariant without the full E2E store plumbing.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as GitHubAppModule from "@/lib/github-app";
import type * as ContentSnapshotModule from "@/lib/content-snapshot";

vi.mock("@/lib/env", () => ({
  env: {
    NEXTAUTH_SECRET: "x".repeat(32),
    NEXTAUTH_URL: "https://x.test",
    NEXTAUTH_SESSION_MAX_AGE: 2_592_000,
    GITHUB_OAUTH_CLIENT_ID: "test-client-id",
    GITHUB_OAUTH_CLIENT_SECRET: "test-client-secret",
    GITHUB_APP_ID: "12345",
    GITHUB_APP_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----",
    GITHUB_APP_INSTALLATION_ID: "67890",
    GITHUB_REPO_OWNER: "owner",
    GITHUB_REPO_NAME: "repo",
    GITHUB_REPO_BRANCH: "main",
    COMMUNITY_NAME: "Test Community",
    COMMUNITY_SLUG: "test",
    TELEGRAM_BOT_TOKEN: "12345:fake",
    TELEGRAM_CHAT_ID: "-100",
    TELEGRAM_TOPIC_ID: "42",
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ githubHandle: "anton1rsod" })),
}));

const mockClient = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  deleteFile: vi.fn(),
};

vi.mock("@/lib/github-app", async () => {
  const actual =
    await vi.importActual<typeof GitHubAppModule>("@/lib/github-app");
  return { ...actual, createGitHubApp: vi.fn(() => mockClient) };
});

vi.mock("@/lib/content-snapshot", async () => {
  const actual =
    await vi.importActual<typeof ContentSnapshotModule>("@/lib/content-snapshot");
  return {
    ...actual,
    findMemberByHandle: vi.fn((h: string) =>
      h === "anton1rsod"
        ? { slug: "anton-safronov", name: "Anton Safronov" }
        : undefined,
    ),
    // H121: loadMemberProfileFresh is the fresh-fetch accessor used by the action.
    loadMemberProfileFresh: vi.fn(async () => ({
      data: { telegramEcho: true },
    })),
  };
});

import { postStatus } from "@/app/actions/status";
import { loadMemberProfileFresh } from "@/lib/content-snapshot";

describe("postStatus → notifyTelegram (H118 opt-in + H121 fresh-fetch)", () => {
  beforeEach(() => {
    mockClient.readFile.mockReset();
    mockClient.writeFile.mockReset();
    mockClient.deleteFile.mockReset();
    vi.mocked(loadMemberProfileFresh).mockReset();
    vi.mocked(loadMemberProfileFresh).mockResolvedValue({ data: { telegramEcho: true } });
    vi.restoreAllMocks();
  });

  it("fires fetch to api.telegram.org when opt-in is true (H118)", async () => {
    mockClient.writeFile.mockResolvedValueOnce({ sha: "sha1" });

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    // Re-register mock after restoreAllMocks cleared it.
    vi.mocked(loadMemberProfileFresh).mockResolvedValue({ data: { telegramEcho: true } });

    const result = await postStatus({
      week: "2026-W22",
      body: "Shipped v0.9.1.1",
      mode: "shipping-log",
    });

    expect(result.ok).toBe(true);

    // Allow the fire-and-forget void promise to settle.
    await new Promise((r) => setTimeout(r, 10));

    const telegramCalls = fetchSpy.mock.calls.filter(([url]) =>
      String(url).includes("api.telegram.org"),
    );
    expect(telegramCalls).toHaveLength(1);
  });

  it("does NOT fire fetch to api.telegram.org when opt-in is false (H118)", async () => {
    mockClient.writeFile.mockResolvedValueOnce({ sha: "sha2" });
    vi.mocked(loadMemberProfileFresh).mockResolvedValueOnce({ data: { telegramEcho: false } });

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const result = await postStatus({
      week: "2026-W22",
      body: "No echo",
    });

    expect(result.ok).toBe(true);
    await new Promise((r) => setTimeout(r, 10));

    const telegramCalls = fetchSpy.mock.calls.filter(([url]) =>
      String(url).includes("api.telegram.org"),
    );
    expect(telegramCalls).toHaveLength(0);
  });

  it("status write succeeds even if Telegram API rejects (H119)", async () => {
    mockClient.writeFile.mockResolvedValueOnce({ sha: "sha3" });
    vi.mocked(loadMemberProfileFresh).mockResolvedValue({ data: { telegramEcho: true } });

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNRESET"));

    const result = await postStatus({
      week: "2026-W22",
      body: "Echo will fail",
      mode: "shipping-log",
    });

    // Status write must succeed regardless of echo failure.
    expect(result.ok).toBe(true);
  });
});
