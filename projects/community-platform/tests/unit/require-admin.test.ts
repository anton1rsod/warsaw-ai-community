// tests/unit/require-admin.test.ts
//
// TDD tests for lib/require-admin.ts (H161 + H162).
// Written BEFORE the implementation (RED phase).

import { describe, it, expect, vi, beforeEach } from "vitest";

// --- mocks ----------------------------------------------------------------

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/content-snapshot", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...(actual as object), isAdmin: vi.fn() };
});

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
}));

vi.mock("@/lib/log", () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";
import { redirect } from "next/navigation";
import { log } from "@/lib/log";

// --- helpers ---------------------------------------------------------------

async function callRequireAdmin(routeLabel = "/admin/test") {
  const { requireAdmin } = await import("@/lib/require-admin");
  return requireAdmin(routeLabel);
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

// ── gate behaviour ────────────────────────────────────────────────────────

describe("requireAdmin — gate behaviour", () => {
  it("returns the session when caller is an admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);

    const session = await callRequireAdmin();
    expect(session).toMatchObject({ githubHandle: "anton1rsod" });
  });

  it("redirects to /login when no session (signed-out)", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    await expect(callRequireAdmin()).rejects.toThrow("__redirect__:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /home when signed-in but not admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "regularmember",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(false);

    await expect(callRequireAdmin()).rejects.toThrow("__redirect__:/home");
    expect(redirect).toHaveBeenCalledWith("/home");
  });
});

// ── H162: denied access emits log line ────────────────────────────────────

describe("H162 — denied admin access emits log.info", () => {
  it("emits admin-access-denied log with route + handle when non-admin hits the gate", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "snooper",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(false);

    await expect(callRequireAdmin("/admin/invite")).rejects.toThrow(
      "__redirect__:/home",
    );

    expect(log.info).toHaveBeenCalledWith(
      "require-admin",
      "admin-access-denied",
      expect.objectContaining({
        route: "/admin/invite",
        handle: "snooper",
      }),
    );
  });

  it("does NOT emit a log line when the caller is a valid admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);

    await callRequireAdmin("/admin/health");

    expect(log.info).not.toHaveBeenCalled();
  });

  it("does NOT emit an admin-access-denied log when caller has no session (normal sign-out flow)", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    await expect(callRequireAdmin("/admin/health")).rejects.toThrow(
      "__redirect__:/login",
    );

    expect(log.info).not.toHaveBeenCalled();
  });
});
