import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Header } from "@/app/components/Header";

afterEach(() => cleanup());

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
}));

const { auth } = await import("@/lib/auth");
const { findMemberByHandle } = await import("@/lib/content-snapshot");

describe("Header — anonymous render", () => {
  it("shows [Sign in] button when no session", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.queryByLabelText("Account")).toBeNull();
  });

  it("renders wordmark linking to /", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    const wordmark = screen.getByRole("link", { name: /Warsaw AI/ });
    expect(wordmark.getAttribute("href")).toBe("/");
    expect(wordmark.className).toMatch(/font-semibold/);
  });

  it("renders 5-item top nav (Q2.1)", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    const navLinks = screen
      .getAllByRole("link")
      .filter((l) => /^(Home|Calendar|Projects|Members|Handbook)$/.test(l.textContent || ""));
    expect(navLinks).toHaveLength(5);
    expect(navLinks.map((l) => l.textContent)).toEqual([
      "Home",
      "Calendar",
      "Projects",
      "Members",
      "Handbook",
    ]);
  });
});

describe("H58: header auth-state stability + dropdown shape (Q2.4)", () => {
  it("shows account dropdown with exactly 4 items (Q2.4)", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      githubHandle: "anton1rsod",
    });
    (findMemberByHandle as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      slug: "anton-safronov",
      handle: "anton1rsod",
      name: "Anton Safronov",
    });
    render(await Header());
    const account = screen.getByLabelText("Account");
    expect(account).toBeInTheDocument();
    const dropdownItems = screen.getAllByRole("menuitem");
    expect(dropdownItems).toHaveLength(4);
    expect(dropdownItems[0]?.textContent).toMatch(/@anton1rsod/);
    expect(dropdownItems[1]?.textContent).toBe("Your week");
    expect(dropdownItems[2]?.textContent).toBe("Edit profile");
    expect(dropdownItems[3]?.textContent).toBe("Sign out");
  });

  it("does NOT render 'Members' in the dropdown (drops v0.3.1's 5th item)", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      githubHandle: "anton1rsod",
    });
    (findMemberByHandle as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      slug: "anton-safronov",
      handle: "anton1rsod",
      name: "Anton Safronov",
    });
    render(await Header());
    const dropdownItems = screen
      .getAllByRole("menuitem")
      .map((item) => item.textContent);
    expect(dropdownItems).not.toContain("Members");
  });
});

describe("Header — signed-in render (chrome only)", () => {
  it("renders 32px avatar as dropdown trigger", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      githubHandle: "anton1rsod",
    });
    (findMemberByHandle as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      slug: "anton-safronov",
      handle: "anton1rsod",
      name: "Anton Safronov",
    });
    render(await Header());
    const img = screen.queryByRole("img");
    expect(img?.getAttribute("width")).toBe("32");
  });
});

describe("H65: skip-to-content link", () => {
  it("renders skip-to-content as first focusable element", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    const skip = screen.getByText("Skip to content");
    expect(skip).toBeInTheDocument();
    expect(skip.getAttribute("href")).toBe("#main");
    expect(skip.className).toMatch(/sr-only|focus:not-sr-only/);
  });
});

describe("Header — current-page state", () => {
  it("applies accent-700 underline to active nav link (Q4.8)", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header({ activePath: "/calendar" }));
    const active = screen.getByRole("link", { name: "Calendar" });
    expect(active.className).toMatch(/accent-700/);
    expect(active.className).toMatch(/underline/);
  });
});
