import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  env: { INVITE_SECRET: "test-secret-do-not-use-in-prod-".padEnd(32, "x") },
}));

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
  isAdmin: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("__notFound__");
  }),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { mintToken } from "@/lib/invitations";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const SECRET = "test-secret-do-not-use-in-prod-".padEnd(32, "x");

function validToken(): string {
  return mintToken(
    {
      jti: "11111111-2222-4333-8444-555555555555",
      iss: "anton1rsod",
      exp: Math.floor(Date.now() / 1000) + 7 * 86400,
      hint_telegram: "@invitee",
    },
    SECRET,
  );
}

describe("H5: /onboard page — first-GET redirect-to-clean-URL", () => {
  it("sets a __Secure-warsaw_invite cookie and redirects when ?token=… is present", async () => {
    const cookieStoreSet = vi.fn();
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => undefined),
      set: cookieStoreSet,
    } as never);
    const { default: OnboardPage } = await import("@/app/onboard/page");
    await expect(
      OnboardPage({ searchParams: Promise.resolve({ token: validToken() }) }),
    ).rejects.toThrow(/__redirect__/);
    expect(redirect).toHaveBeenCalledWith("/onboard");
    expect(cookieStoreSet).toHaveBeenCalledWith(
      "__Secure-warsaw_invite",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "strict",
        path: "/onboard",
      }),
    );
  });

  it("notFound() when ?token=… is invalid", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => undefined),
      set: vi.fn(),
    } as never);
    const { default: OnboardPage } = await import("@/app/onboard/page");
    await expect(
      OnboardPage({
        searchParams: Promise.resolve({ token: "not-a-valid-token" }),
      }),
    ).rejects.toThrow(/__notFound__/);
  });
});

describe("H6: /onboard page — cookie + session branches", () => {
  it("renders signin form when cookie present + no GH session", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((n: string) =>
        n === "__Secure-warsaw_invite" ? { value: validToken() } : undefined,
      ),
      set: vi.fn(),
    } as never);
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: OnboardPage } = await import("@/app/onboard/page");
    const tree = await OnboardPage({ searchParams: Promise.resolve({}) });
    render(tree);
    expect(
      screen.getByRole("button", { name: /sign in with github/i }),
    ).toBeInTheDocument();
  });

  it("renders OnboardForm when cookie + session + redeemer NOT in roster", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((n: string) =>
        n === "__Secure-warsaw_invite" ? { value: validToken() } : undefined,
      ),
      set: vi.fn(),
    } as never);
    vi.mocked(auth).mockResolvedValue({ githubHandle: "newmember" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue(undefined);
    const { default: OnboardPage } = await import("@/app/onboard/page");
    const tree = await OnboardPage({ searchParams: Promise.resolve({}) });
    render(tree);
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it("notFound() when cookie + session + redeemer ALREADY in roster", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((n: string) =>
        n === "__Secure-warsaw_invite" ? { value: validToken() } : undefined,
      ),
      set: vi.fn(),
    } as never);
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue({
      name: "Anton",
      githubHandle: "anton1rsod",
      slug: "anton-safronov",
      profile: null,
      persona: null,
    });
    const { default: OnboardPage } = await import("@/app/onboard/page");
    await expect(
      OnboardPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow(/__notFound__/);
  });

  it("notFound() when no cookie and no token query (direct GET)", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => undefined),
      set: vi.fn(),
    } as never);
    const { default: OnboardPage } = await import("@/app/onboard/page");
    await expect(
      OnboardPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow(/__notFound__/);
  });

  it("notFound() when cookie has invalid token (defense-in-depth)", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((n: string) =>
        n === "__Secure-warsaw_invite" ? { value: "garbage" } : undefined,
      ),
      set: vi.fn(),
    } as never);
    const { default: OnboardPage } = await import("@/app/onboard/page");
    await expect(
      OnboardPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow(/__notFound__/);
  });
});
