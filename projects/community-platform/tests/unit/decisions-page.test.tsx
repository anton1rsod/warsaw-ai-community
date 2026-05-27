import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/content-snapshot", () => ({
  listDecisionsFromSnapshot: vi.fn(() => [
    { slug: "0001-oss-first", title: "ADR-0001 — OSS-first (MIT)", status: "accepted", date: "2026-04-01" },
    { slug: "0002-docs-first", title: "ADR-0002 — Docs-first", status: "proposed", date: "2026-04-10" },
  ]),
}));

afterEach(() => cleanup());

describe("/decisions — functional", () => {
  it("renders each ADR as a ListItem linking to its detail page", async () => {
    const { default: DecisionsPage } = await import("@/app/decisions/page");
    render(DecisionsPage());
    expect(screen.getByText(/ADR-0001/)).toBeInTheDocument();
    expect(screen.getByText(/ADR-0002/)).toBeInTheDocument();
    // Links should point to detail pages
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs.some((h) => h?.includes("0001-oss-first"))).toBe(true);
  });

  it("renders empty state when no decisions", async () => {
    const { listDecisionsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listDecisionsFromSnapshot).mockReturnValueOnce([]);
    const { default: DecisionsPage } = await import("@/app/decisions/page");
    render(DecisionsPage());
    expect(screen.getByText(/No decisions yet/i)).toBeInTheDocument();
  });
});

describe("/decisions v0.9 — warm-aesthetic, no dark:/scaffolding (H99)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/decisions/page.tsx"),
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
  it("uses ListItem rows", () => { expect(src).toMatch(/ListItem/); });
  it("uses Tag for status chips", () => { expect(src).toMatch(/Tag/); });
});
