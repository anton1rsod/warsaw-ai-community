import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type * as ContentSnapshotModule from "@/lib/content-snapshot";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));
vi.mock("@/lib/content-snapshot", async (importOriginal) => {
  const actual =
    await importOriginal<typeof ContentSnapshotModule>();
  return {
    ...actual,
    isAdmin: vi.fn(),
  };
});
vi.mock("@/lib/env", () => ({
  env: {
    INVITE_SECRET: "x".repeat(32),
    NEXTAUTH_URL: "http://localhost:3000",
    GITHUB_APP_ID: "x",
    GITHUB_APP_PRIVATE_KEY: "x",
    GITHUB_APP_INSTALLATION_ID: "x",
    GITHUB_REPO_OWNER: "anton1rsod",
    GITHUB_REPO_NAME: "warsaw-ai-community",
    GITHUB_REPO_BRANCH: "main",
  },
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
}));

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";
import { redirect } from "next/navigation";

afterEach(cleanup);

describe("/admin/invite page", () => {
  it("renders the InviteForm for an admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const { default: AdminInvitePage } = await import(
      "@/app/admin/invite/page"
    );
    const tree = await AdminInvitePage();
    render(tree);
    expect(screen.getByLabelText(/telegram hint/i)).toBeInTheDocument();
  });

  it("redirects non-admin to /home (matches /admin/health pattern)", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "regularmember",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(false);
    const { default: AdminInvitePage } = await import(
      "@/app/admin/invite/page"
    );
    await expect(AdminInvitePage()).rejects.toThrow(/__redirect__/);
    expect(redirect).toHaveBeenCalledWith("/home");
  });

  it("redirects unauthenticated to /login", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: AdminInvitePage } = await import(
      "@/app/admin/invite/page"
    );
    await expect(AdminInvitePage()).rejects.toThrow(/__redirect__/);
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
