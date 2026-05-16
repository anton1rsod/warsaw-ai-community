import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TopContributors } from "@/app/components/TopContributors";

afterEach(cleanup);

describe("TopContributors", () => {
  it("renders 'No contributors yet' when list is empty", () => {
    render(<TopContributors contributors={[]} />);
    expect(screen.getByText(/no contributors yet/i)).toBeInTheDocument();
  });

  it("renders contributors with @handle + commit count", () => {
    render(
      <TopContributors
        contributors={[
          { handle: "anton1rsod", commits: 179 },
          { handle: "markspas", commits: 3 },
        ]}
      />,
    );
    expect(screen.getByText("@anton1rsod")).toBeInTheDocument();
    expect(screen.getByText("179")).toBeInTheDocument();
    expect(screen.getByText("@markspas")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("links each contributor to /members/<slug> using slugFor when provided", () => {
    render(
      <TopContributors
        contributors={[{ handle: "anton1rsod", commits: 1 }]}
        slugFor={(h) => (h === "anton1rsod" ? "anton-safronov" : h)}
      />,
    );
    const link = screen.getByRole("link", { name: /anton1rsod/i });
    expect(link.getAttribute("href")).toBe("/members/anton-safronov");
  });

  it("falls back to handle when slugFor is not provided (identity default)", () => {
    render(
      <TopContributors contributors={[{ handle: "anton1rsod", commits: 1 }]} />,
    );
    const link = screen.getByRole("link", { name: /anton1rsod/i });
    expect(link.getAttribute("href")).toBe("/members/anton1rsod");
  });

  it("renders bot-exclusion subtext", () => {
    render(<TopContributors contributors={[{ handle: "a", commits: 1 }]} />);
    expect(screen.getByText(/bot commits excluded/i)).toBeInTheDocument();
  });
});
