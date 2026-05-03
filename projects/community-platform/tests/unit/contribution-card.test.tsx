import { afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContributionCard } from "@/app/components/ContributionCard";

afterEach(cleanup);

describe("ContributionCard", () => {
  it("renders four metrics with values and labels", () => {
    render(
      <ContributionCard
        contributions={{
          projectCommits: 12,
          adrsFiled: 3,
          meetingsAttended: 8,
          statusPosts: 5,
        }}
      />,
    );
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/project commits/i)).toBeInTheDocument();
    expect(screen.getByText(/adrs filed/i)).toBeInTheDocument();
    expect(screen.getByText(/meetings attended/i)).toBeInTheDocument();
    expect(screen.getByText(/status posts/i)).toBeInTheDocument();
  });

  it("renders zeros when there are no contributions", () => {
    render(
      <ContributionCard
        contributions={{
          projectCommits: 0,
          adrsFiled: 0,
          meetingsAttended: 0,
          statusPosts: 0,
        }}
      />,
    );
    expect(screen.getAllByText("0")).toHaveLength(4);
  });

  it("includes a derivation note about git history", () => {
    render(
      <ContributionCard
        contributions={{
          projectCommits: 1,
          adrsFiled: 0,
          meetingsAttended: 0,
          statusPosts: 0,
        }}
      />,
    );
    expect(screen.getByText(/derived from git history/i)).toBeInTheDocument();
  });
});
