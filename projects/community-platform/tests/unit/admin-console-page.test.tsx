// tests/unit/admin-console-page.test.tsx
//
// R1 + H161: Admin console index page
// Written BEFORE the implementation (TDD RED phase).

import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

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

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";
import { redirect } from "next/navigation";

afterEach(cleanup);

describe("/admin page — gate (H161 via requireAdmin)", () => {
  it("redirects to /login when not signed in", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: Page } = await import("@/app/admin/page");
    await expect(Page()).rejects.toThrow("__redirect__:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /home when signed in but not admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "regularmember",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(false);
    const { default: Page } = await import("@/app/admin/page");
    await expect(Page()).rejects.toThrow("__redirect__:/home");
    expect(redirect).toHaveBeenCalledWith("/home");
  });

  it("renders the Admin console heading for an admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const { default: Page } = await import("@/app/admin/page");
    const tree = await Page();
    render(tree);
    expect(
      screen.getByRole("heading", { name: /admin console/i }),
    ).toBeInTheDocument();
  });
});

describe("/admin page — R1 tool links", () => {
  it("shows all three admin tool links: Invite, New event, Health", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const { default: Page } = await import("@/app/admin/page");
    const tree = await Page();
    render(tree);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/admin/invite");
    expect(hrefs).toContain("/admin/events/new");
    expect(hrefs).toContain("/admin/health");
  });

  it("renders the MonoLabel 'Admin' kicker", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const { default: Page } = await import("@/app/admin/page");
    const tree = await Page();
    render(tree);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });
});

describe("/admin page — no dark: scaffolding (H98)", () => {
  it("source contains no dark: Tailwind classes", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const src = readFileSync(
      resolve(process.cwd(), "app/admin/page.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/\bdark:/);
  });
});
