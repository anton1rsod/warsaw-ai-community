import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/__generated__/kudos.json", () => ({
  default: {
    "anton-safronov": {
      total: 5,
      by_type: { status: 3, contribution: 1, meeting: 1 },
      recent: [
        { giver: "alice", item_type: "status", item_id: "x", given_at: "2026-05-12T10:00:00Z" },
        { giver: "bob", item_type: "contribution", item_id: "y", given_at: "2026-05-10T10:00:00Z" },
      ],
    },
    "no-recent": {
      total: 3,
      by_type: { status: 3, contribution: 0, meeting: 0 },
      recent: [],
    },
    "zeroed-out": {
      total: 0,
      by_type: { status: 0, contribution: 0, meeting: 0 },
      recent: [],
    },
  },
}));

import { KudosCount } from "@/app/components/KudosCount";

afterEach(cleanup);

describe("H51: KudosCount (D19 display side)", () => {
  it("renders 'Thanked N times' pill when count > 0", () => {
    render(<KudosCount memberSlug="anton-safronov" />);
    expect(screen.getByText(/Thanked 5 times/i)).toBeInTheDocument();
  });

  it("renders recent givers when entry has recent[]", () => {
    render(<KudosCount memberSlug="anton-safronov" />);
    expect(screen.getByText(/Recent: @alice, @bob/)).toBeInTheDocument();
  });

  it("renders pill without recent line when entry.recent is empty", () => {
    render(<KudosCount memberSlug="no-recent" />);
    expect(screen.getByText(/Thanked 3 times/i)).toBeInTheDocument();
    expect(screen.queryByText(/Recent:/)).not.toBeInTheDocument();
  });

  it("renders empty state when member has no kudos entry", () => {
    render(<KudosCount memberSlug="unknown-member" />);
    expect(screen.getByText(/No thanks yet/i)).toBeInTheDocument();
  });

  it("renders empty state when entry.total = 0", () => {
    render(<KudosCount memberSlug="zeroed-out" />);
    expect(screen.getByText(/No thanks yet/i)).toBeInTheDocument();
  });
});
