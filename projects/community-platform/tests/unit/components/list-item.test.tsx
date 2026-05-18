import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ListItem } from "@/app/components/ListItem";

afterEach(() => cleanup());

describe("ListItem — Q5.1 / D36 props contract", () => {
  it("renders title as primary text linked to href", () => {
    render(<ListItem href="/events/2026-05-21-sync" title="Weekly sync" />);
    const link = screen.getByRole("link", { name: /Weekly sync/ });
    expect(link.getAttribute("href")).toBe("/events/2026-05-21-sync");
  });

  it("renders subtitle below title when provided", () => {
    render(
      <ListItem
        href="/x"
        title="Title"
        subtitle="Subtitle line"
      />,
    );
    expect(screen.getByText("Subtitle line")).toBeInTheDocument();
  });

  it("renders meta slot text", () => {
    render(
      <ListItem href="/x" title="Title" meta="Wed May 21 · 18:30" />,
    );
    expect(screen.getByText("Wed May 21 · 18:30")).toBeInTheDocument();
  });

  it("renders avatar when provided", () => {
    render(
      <ListItem
        href="/x"
        title="Title"
        avatar={{ name: "Anton", handle: "anton1rsod", size: 32 }}
      />,
    );
    // Avatar renders an <img> for the GitHub URL (H59-gated by next.config)
    expect(screen.queryByRole("img")).not.toBeNull();
  });

  it("renders trailing slot as ReactNode", () => {
    render(
      <ListItem
        href="/x"
        title="Title"
        trailing={<span data-testid="trailing-chip">Going</span>}
      />,
    );
    expect(screen.getByTestId("trailing-chip")).toBeInTheDocument();
  });

  it("padding + hover + focus-visible classes per Q5.1", () => {
    render(<ListItem href="/x" title="T" />);
    const link = screen.getByRole("link");
    expect(link.className).toMatch(/py-3/);
    expect(link.className).toMatch(/px-4/);
    expect(link.className).toMatch(/hover:bg-neutral-50/);
    expect(link.className).toMatch(/focus-visible:ring-2/);
    expect(link.className).toMatch(/ring-accent-500/);
    expect(link.className).toMatch(/ring-offset-2/);
  });

  it("omits subtitle / meta / avatar / trailing slots when undefined", () => {
    render(<ListItem href="/x" title="Just a title" />);
    expect(screen.getByText("Just a title")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
