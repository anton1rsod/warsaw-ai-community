import { describe, expect, it } from "vitest";
import { computeContributions, type GitCommit } from "@/lib/contributions";

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
