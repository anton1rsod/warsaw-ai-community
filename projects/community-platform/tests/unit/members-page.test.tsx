import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/content-snapshot", () => ({
  listMembers: vi.fn(() => [
    { slug: "alice-smith", name: "Alice Smith", githubHandle: "alice", photoOptOut: false },
    { slug: "bob-jones", name: "Bob Jones", githubHandle: "bob", photoOptOut: false },
  ]),
}));

afterEach(() => cleanup());

describe("/members — functional", () => {
  it("renders each member card with name and handle", async () => {
    const { default: MembersPage } = await import("@/app/members/page");
    render(MembersPage());
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    // Handle displayed as @handle
    expect(screen.getByText("@alice")).toBeInTheDocument();
  });

  it("links each card to the member profile", async () => {
    const { default: MembersPage } = await import("@/app/members/page");
    render(MembersPage());
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs.some((h) => h?.includes("alice-smith"))).toBe(true);
  });
});

describe("/members v0.9 — warm-aesthetic card grid (D7, H99)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/members/page.tsx"),
    "utf8",
  );
  it("uses no Tailwind `dark:` variants", () => { expect(src).not.toMatch(/\bdark:/); });
  it("uses no neutral-* / gray-* color scale", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("uses no rounded-border scaffolding", () => { expect(src).not.toMatch(/\brounded\b/); });
  it("uses recipe tokens (font-display heading on ink)", () => {
    expect(src).toMatch(/font-display/);
    expect(src).toMatch(/text-ink|text-dust/);
  });
  it("uses Avatar component for member monograms", () => { expect(src).toMatch(/Avatar/); });
  it("uses bg-paper cards (D7)", () => { expect(src).toMatch(/bg-paper/); });
  it("uses 2-col grid layout", () => { expect(src).toMatch(/grid-cols/); });
});
