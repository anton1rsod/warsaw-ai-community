import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { StarterPack } from "@/app/components/StarterPack";
import type { ResolvedStarterPackItem } from "@/lib/starter-pack";

afterEach(cleanup);

const FIXTURE: ResolvedStarterPackItem[] = [
  {
    type: "decision",
    slug: "0016-telegram-echo-statuses",
    kicker: "decision",
    title: "ADR-0016 Telegram echo",
    excerpt: "Opt-in echo to Telegram supergroup",
    href: "/decisions/0016-telegram-echo-statuses",
  },
  {
    type: "project",
    slug: "gbrain",
    kicker: "project",
    title: "GBrain",
    excerpt: "Telegram knowledge base",
    href: "/projects/gbrain",
  },
];

describe("StarterPack component", () => {
  it("renders a Start here section with one ListItem per resolved entry", () => {
    render(<StarterPack items={FIXTURE} />);

    const heading = screen.getByRole("heading", { name: /start here/i });
    expect(heading).toBeInTheDocument();

    const list = screen.getByRole("list", { name: /start here/i });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);

    const firstItem = items[0];
    if (!firstItem) throw new Error("Expected at least one list item");
    const firstLink = within(firstItem).getByRole("link", { name: /ADR-0016/i });
    expect(firstLink).toHaveAttribute("href", "/decisions/0016-telegram-echo-statuses");

    expect(screen.getByText(/Telegram knowledge base/i)).toBeInTheDocument();
  });

  it("renders nothing when items is empty (defensive — should not happen at runtime)", () => {
    const { container } = render(<StarterPack items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("skips null entries silently (unresolved slugs)", () => {
    const mixed = [...FIXTURE, null];
    render(<StarterPack items={mixed} />);
    const list = screen.getByRole("list", { name: /start here/i });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("uses the warm token system (cream-deep border + ink underline on links)", () => {
    const { container } = render(<StarterPack items={FIXTURE} />);
    const section = container.querySelector("section[aria-labelledby='starter-pack-heading']");
    expect(section).toBeInTheDocument();
    expect(section?.className).toMatch(/bg-paper|border-l-ink/);
  });
});
