import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { ActivityLine } from "@/app/components/ActivityLine";
import type { Contributions } from "@/lib/contributions";
import type { EventSlug } from "@/lib/events";

afterEach(cleanup);

const CONTRIBUTIONS: Contributions = {
  projectCommits: 5,
  adrsFiled: 19,
  meetingsAttended: 3,
  statusPosts: 1,
};

describe("ActivityLine (D9 — single mono stat line)", () => {
  it("renders commits, ADRs and status posts with tabular-nums", () => {
    const { container } = render(
      <ActivityLine
        contributions={CONTRIBUTIONS}
        goingSlugs={[]}
        interestedSlugs={[]}
        kudosTotal={0}
      />,
    );
    const line = container.querySelector("p");
    expect(line?.textContent).toContain("5 commits");
    expect(line?.textContent).toContain("19 ADRs");
    expect(line?.textContent).toContain("1 status posts");
    expect(line?.className).toContain("tabular-nums");
  });

  it("renders going (✓) and interested (★) event slugs as links", () => {
    render(
      <ActivityLine
        contributions={CONTRIBUTIONS}
        goingSlugs={["2026-05-21-meetup-4" as EventSlug]}
        interestedSlugs={["2026-07-01-meetup-5" as EventSlug]}
        kudosTotal={0}
      />,
    );
    expect(
      screen.getByRole("link", { name: /✓ 2026-05-21-meetup-4/ }),
    ).toHaveAttribute("href", "/events/2026-05-21-meetup-4");
    expect(
      screen.getByRole("link", { name: /★ 2026-07-01-meetup-5/ }),
    ).toHaveAttribute("href", "/events/2026-07-01-meetup-5");
  });

  it("renders the kudos total — including 0× (D9)", () => {
    const { container } = render(
      <ActivityLine
        contributions={CONTRIBUTIONS}
        goingSlugs={[]}
        interestedSlugs={[]}
        kudosTotal={0}
      />,
    );
    expect(container.textContent).toContain("♥ thanked 0×");
  });

  it("separators are decorative aria-hidden spans", () => {
    const { container } = render(
      <ActivityLine
        contributions={CONTRIBUTIONS}
        goingSlugs={[]}
        interestedSlugs={[]}
        kudosTotal={2}
      />,
    );
    const seps = [...container.querySelectorAll('span[aria-hidden="true"]')].filter(
      (el) => (el.textContent ?? "").includes("·"),
    );
    expect(seps.length).toBeGreaterThanOrEqual(3);
  });
});
