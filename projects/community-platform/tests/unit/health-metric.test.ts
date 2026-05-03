import { describe, expect, it } from "vitest";
import { computeHealthMetric } from "@/lib/health-metric";

const roster = [
  { name: "A", githubHandle: "a", slug: "a" },
  { name: "B", githubHandle: "b", slug: "b" },
  { name: "C", githubHandle: "c", slug: "c" },
  { name: "D", githubHandle: "d", slug: "d" },
];

describe("computeHealthMetric", () => {
  it("computes weekly active posters / total members", () => {
    const result = computeHealthMetric({
      roster,
      weekStatuses: [{ slug: "a" }, { slug: "b" }],
    });
    expect(result.activePosters).toBe(2);
    expect(result.totalMembers).toBe(4);
    expect(result.ratio).toBe(0.5);
  });

  it("returns zero when no posts", () => {
    const result = computeHealthMetric({ roster, weekStatuses: [] });
    expect(result.activePosters).toBe(0);
    expect(result.ratio).toBe(0);
  });

  it("counts each posting member once even with duplicate slugs", () => {
    const result = computeHealthMetric({
      roster,
      weekStatuses: [{ slug: "a" }, { slug: "a" }],
    });
    expect(result.activePosters).toBe(1);
  });

  it("ignores statuses whose slug is not on the roster", () => {
    const result = computeHealthMetric({
      roster,
      weekStatuses: [{ slug: "stranger" }, { slug: "a" }],
    });
    expect(result.activePosters).toBe(1);
    expect(result.ratio).toBe(0.25);
  });

  it("returns 0 ratio for an empty roster (no division by zero)", () => {
    const result = computeHealthMetric({
      roster: [],
      weekStatuses: [{ slug: "a" }],
    });
    expect(result.activePosters).toBe(0);
    expect(result.totalMembers).toBe(0);
    expect(result.ratio).toBe(0);
  });
});
