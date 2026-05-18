import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import HandbookPage from "@/app/handbook/page";

afterEach(() => cleanup());

describe("/handbook — Q2.3 / D29 / O4 / Q6.1 (i)", () => {
  it("renders Handbook title", async () => {
    render(await HandbookPage());
    expect(screen.getByText("Handbook")).toBeInTheDocument();
  });

  it("renders charter section with pointer link", async () => {
    render(await HandbookPage());
    expect(screen.getByText("Charter")).toBeInTheDocument();
    const charterLink = screen.getByRole("link", { name: /Read the charter/ });
    expect(charterLink.getAttribute("href")).toMatch(
      /github\.com.*charter\.md|community\/charter/
    );
  });

  it("O4: roadmap pointer links to monorepo PROJECTS.md on GitHub", async () => {
    render(await HandbookPage());
    expect(screen.getByText("Roadmap")).toBeInTheDocument();
    const roadmapLink = screen.getByRole("link", {
      name: /Active and planned sub-projects/,
    });
    expect(roadmapLink.getAttribute("href")).toBe(
      "https://github.com/anton1rsod/warsaw-ai-community/blob/main/PROJECTS.md"
    );
    expect(roadmapLink.getAttribute("target")).toBe("_blank");
  });

  it("Decisions section links to GitHub tree, NOT to /decisions UI (Q6.1 A1)", async () => {
    render(await HandbookPage());
    const decisionsLink = screen.getByRole("link", {
      name: /Decisions live in our public git repo/,
    });
    expect(decisionsLink.getAttribute("href")).toMatch(
      /github\.com\/anton1rsod\/warsaw-ai-community\/tree\/main\/docs\/decisions/
    );
  });

  it("Q6.1 (i): NO ADR markdown content rendered in the page UI", async () => {
    render(await HandbookPage());
    expect(screen.queryByText(/^0001\./)).toBeNull();
    expect(screen.queryByText(/^0014\./)).toBeNull();
    expect(screen.queryByText(/Accepted$/)).toBeNull();
    expect(screen.queryByText(/Proposed$/)).toBeNull();
  });

  it("renders v0.5+ placeholder list with 'TBD placement' labels", async () => {
    render(await HandbookPage());
    expect(screen.getByText(/Skills.*TBD placement/)).toBeInTheDocument();
    expect(screen.getByText(/Academy.*TBD placement/)).toBeInTheDocument();
    expect(
      screen.getByText(/GBrain Q&A.*TBD placement/)
    ).toBeInTheDocument();
  });
});
