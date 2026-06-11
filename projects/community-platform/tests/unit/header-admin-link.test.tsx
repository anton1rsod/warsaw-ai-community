// tests/unit/header-admin-link.test.tsx
//
// R2: Header dropdown "admin console" link — present only for admins.
// Written BEFORE the implementation (TDD RED phase).

import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/home"),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Map([["x-pathname", "/home"]])),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
  isAdmin: vi.fn(),
}));

import { auth } from "@/lib/auth";
import {
  findMemberByHandle,
  isAdmin,
} from "@/lib/content-snapshot";

afterEach(() => cleanup());

describe("Header — R2: admin console dropdown link", () => {
  it("shows 'admin console' link in dropdown when viewer isAdmin", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue({
      slug: "anton-safronov",
      githubHandle: "anton1rsod",
      name: "Anton Safronov",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);

    const { Header } = await import("@/app/components/Header");
    render(await Header());

    const adminLink = screen.getByRole("link", { name: /admin console/i });
    expect(adminLink).toBeInTheDocument();
    expect(adminLink.getAttribute("href")).toBe("/admin");
  });

  it("does NOT show 'admin console' link when viewer is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "regularmember",
    } as never);
    vi.mocked(findMemberByHandle).mockReturnValue({
      slug: "regular-member",
      githubHandle: "regularmember",
      name: "Regular Member",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(false);

    const { Header } = await import("@/app/components/Header");
    render(await Header());

    expect(
      screen.queryByRole("link", { name: /admin console/i }),
    ).not.toBeInTheDocument();
  });

  it("does NOT show 'admin console' link for anonymous visitors", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const { Header } = await import("@/app/components/Header");
    render(await Header());

    expect(
      screen.queryByRole("link", { name: /admin console/i }),
    ).not.toBeInTheDocument();
  });
});
