import { describe, expect, it } from "vitest";
import {
  computeContributions,
  computeProjectContributions,
  TOP_CONTRIBUTORS_LIMIT,
  type GitCommit,
} from "@/lib/contributions";

const commits: GitCommit[] = [
  {
    sha: "a",
    author: "antonsafronov",
    date: "2026-04-24",
    files: ["projects/gbrain/spec.md"],
  },
  {
    sha: "b",
    author: "antonsafronov",
    date: "2026-04-25",
    files: ["docs/decisions/0001-x.md"],
  },
  {
    sha: "c",
    author: "alice-ex",
    date: "2026-04-26",
    files: ["projects/community-platform/app/page.tsx"],
  },
  {
    sha: "d",
    author: "warsaw-ai-bot",
    date: "2026-04-27",
    files: ["community/status/2026-W17/anton-safronov.md"],
  },
];

const meetings = [
  { slug: "2026-04-24", attendees: ["Anton Safronov", "Alice Example"] },
  { slug: "2026-04-17", attendees: ["Anton Safronov"] },
];

const roster = [
  {
    name: "Anton Safronov",
    githubHandle: "antonsafronov",
    slug: "anton-safronov",
  },
  { name: "Alice Example", githubHandle: "alice-ex", slug: "alice-example" },
];

describe("contributions", () => {
  it("counts authored commits to project folders, excluding bot", () => {
    const c = computeContributions({ commits, meetings, roster });
    expect(c["antonsafronov"]?.projectCommits).toBe(1);
    expect(c["alice-ex"]?.projectCommits).toBe(1);
  });

  it("counts ADRs filed", () => {
    const c = computeContributions({ commits, meetings, roster });
    expect(c["antonsafronov"]?.adrsFiled).toBe(1);
  });

  it("counts status posts (bot-authored excluded)", () => {
    const c = computeContributions({ commits, meetings, roster });
    // The status post in the fixture is bot-authored, so no member gets credit.
    expect(c["antonsafronov"]?.statusPosts).toBe(0);
  });

  it("credits status posts to authoring member when not bot", () => {
    const memberAuthored: GitCommit[] = [
      {
        sha: "x",
        author: "antonsafronov",
        date: "2026-04-28",
        files: ["community/status/2026-W17/anton-safronov.md"],
      },
    ];
    const c = computeContributions({
      commits: memberAuthored,
      meetings: [],
      roster,
    });
    expect(c["antonsafronov"]?.statusPosts).toBe(1);
  });

  it("counts meeting attendance by name match", () => {
    const c = computeContributions({ commits, meetings, roster });
    expect(c["antonsafronov"]?.meetingsAttended).toBe(2);
    expect(c["alice-ex"]?.meetingsAttended).toBe(1);
  });

  it("ignores commits from non-roster authors", () => {
    const ghost: GitCommit[] = [
      {
        sha: "z",
        author: "stranger",
        date: "2026-04-29",
        files: ["projects/gbrain/spec.md", "docs/decisions/0002-y.md"],
      },
    ];
    const c = computeContributions({ commits: ghost, meetings: [], roster });
    expect(c["stranger"]).toBeUndefined();
    expect(c["antonsafronov"]?.projectCommits).toBe(0);
    expect(c["antonsafronov"]?.adrsFiled).toBe(0);
  });

  it("normalizes author casing to lowercase before lookup", () => {
    const upper: GitCommit[] = [
      {
        sha: "u",
        author: "AntonSafronov",
        date: "2026-04-29",
        files: ["projects/gbrain/spec.md"],
      },
    ];
    const c = computeContributions({ commits: upper, meetings: [], roster });
    expect(c["antonsafronov"]?.projectCommits).toBe(1);
  });

  it("treats warsaw-ai-bot[bot] as a bot author", () => {
    const botBracket: GitCommit[] = [
      {
        sha: "k",
        author: "warsaw-ai-bot[bot]",
        date: "2026-04-29",
        files: ["projects/gbrain/spec.md"],
      },
    ];
    const c = computeContributions({
      commits: botBracket,
      meetings: [],
      roster,
    });
    expect(c["antonsafronov"]?.projectCommits).toBe(0);
  });

  it("ignores meeting attendees not on roster", () => {
    const c = computeContributions({
      commits: [],
      meetings: [{ slug: "2026-04-24", attendees: ["Stranger"] }],
      roster,
    });
    expect(c["antonsafronov"]?.meetingsAttended).toBe(0);
  });

  it("returns zeros for members with no signals", () => {
    const r = [
      ...roster,
      { name: "Bob", githubHandle: "bob", slug: "bob" },
    ];
    const c = computeContributions({ commits, meetings, roster: r });
    expect(c["bob"]).toEqual({
      projectCommits: 0,
      adrsFiled: 0,
      meetingsAttended: 0,
      statusPosts: 0,
    });
  });
});

const baseRoster = [
  { name: "Anton Safronov", githubHandle: "anton1rsod", slug: "anton-safronov" },
  { name: "Bob Builder", githubHandle: "bobthebuilder", slug: "bob-builder" },
];

describe("computeProjectContributions", () => {
  it("buckets per-commit, de-duplicating files in the same project", () => {
    const commits: GitCommit[] = [
      {
        sha: "a1",
        author: "anton1rsod",
        date: "2026-01-01T00:00:00Z",
        files: [
          "projects/foo/a.md",
          "projects/foo/b.md",
          "projects/foo/c.md",
        ],
      },
    ];
    const result = computeProjectContributions({ commits, roster: baseRoster });
    expect(result.foo).toEqual([{ handle: "anton1rsod", commits: 1 }]);
  });

  it("counts a single commit once per distinct project touched", () => {
    const commits: GitCommit[] = [
      {
        sha: "a1",
        author: "anton1rsod",
        date: "2026-01-01T00:00:00Z",
        files: ["projects/foo/a.md", "projects/bar/b.md"],
      },
    ];
    const result = computeProjectContributions({ commits, roster: baseRoster });
    expect(result.foo).toEqual([{ handle: "anton1rsod", commits: 1 }]);
    expect(result.bar).toEqual([{ handle: "anton1rsod", commits: 1 }]);
  });

  it("sorts contributors desc by commit count and truncates to TOP_CONTRIBUTORS_LIMIT", () => {
    expect(TOP_CONTRIBUTORS_LIMIT).toBe(5);

    // 6 contributors; only top 5 should appear.
    const roster = Array.from({ length: 6 }, (_, i) => ({
      name: `User ${i}`,
      githubHandle: `user${i}`,
      slug: `user-${i}`,
    }));
    const commits: GitCommit[] = roster.flatMap((m, i) =>
      Array.from({ length: i + 1 }, (_, j) => ({
        sha: `${m.githubHandle}-${j}`,
        author: m.githubHandle,
        date: "2026-01-01T00:00:00Z",
        files: ["projects/foo/a.md"],
      })),
    );
    const result = computeProjectContributions({ commits, roster });
    expect(result.foo).toHaveLength(5);
    expect(result.foo?.[0]?.commits).toBe(6); // user5 had 6 commits
    expect(result.foo?.[4]?.commits).toBe(2); // user1 had 2 commits
    expect(result.foo?.find((c) => c.handle === "user0")).toBeUndefined();
  });

  describe("H25: project-slug to commit-path mapping uses current path", () => {
    it("attributes commits to the project slug from the current path", () => {
      const commits: GitCommit[] = [
        {
          sha: "a1",
          author: "anton1rsod",
          date: "2026-01-01T00:00:00Z",
          files: ["projects/old-name/file.md"],
        },
        {
          sha: "a2",
          author: "anton1rsod",
          date: "2026-02-01T00:00:00Z",
          files: ["projects/new-name/file.md"],
        },
      ];
      const result = computeProjectContributions({
        commits,
        roster: baseRoster,
      });
      expect(result["old-name"]).toEqual([
        { handle: "anton1rsod", commits: 1 },
      ]);
      expect(result["new-name"]).toEqual([
        { handle: "anton1rsod", commits: 1 },
      ]);
    });
  });

  describe("H26: bot commits excluded from per-project aggregation", () => {
    it("ignores warsaw-ai-bot commits even under per-project bucket", () => {
      const commits: GitCommit[] = [
        {
          sha: "bot-1",
          author: "warsaw-ai-bot",
          date: "2026-01-01T00:00:00Z",
          files: ["projects/foo/x.md"],
        },
        {
          sha: "bot-2",
          author: "warsaw-ai-bot[bot]",
          date: "2026-01-01T00:00:00Z",
          files: ["projects/foo/y.md"],
        },
      ];
      const result = computeProjectContributions({
        commits,
        roster: baseRoster,
      });
      expect(result.foo).toBeUndefined();
    });
  });

  it("drops commits authored by handles not on the roster", () => {
    const commits: GitCommit[] = [
      {
        sha: "a1",
        author: "ghost",
        date: "2026-01-01T00:00:00Z",
        files: ["projects/foo/x.md"],
      },
    ];
    const result = computeProjectContributions({ commits, roster: baseRoster });
    expect(result.foo).toBeUndefined();
  });

  it("ignores files outside projects/", () => {
    const commits: GitCommit[] = [
      {
        sha: "a1",
        author: "anton1rsod",
        date: "2026-01-01T00:00:00Z",
        files: ["docs/decisions/0001-foo.md", "community/members/bob.md"],
      },
    ];
    const result = computeProjectContributions({ commits, roster: baseRoster });
    expect(Object.keys(result)).toHaveLength(0);
  });
});
