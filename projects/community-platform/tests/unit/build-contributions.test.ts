import { describe, expect, it } from "vitest";
import {
  computeContributions,
  computeProjectContributions,
  type GitCommit,
} from "@/lib/contributions";

// Sanity test that the two compute functions can coexist on the same commit
// stream — the build script will call both in sequence.
describe("build-contributions sibling JSON shape", () => {
  it("computeContributions + computeProjectContributions agree on bot exclusion", () => {
    const commits: GitCommit[] = [
      {
        sha: "bot",
        author: "warsaw-ai-bot",
        date: "2026-01-01T00:00:00Z",
        files: ["projects/foo/x.md"],
      },
      {
        sha: "anton",
        author: "anton1rsod",
        date: "2026-01-01T00:00:00Z",
        files: ["projects/foo/y.md"],
      },
    ];
    const roster = [
      { name: "Anton Safronov", githubHandle: "anton1rsod", slug: "anton-safronov" },
    ];

    const perMember = computeContributions({ commits, meetings: [], roster });
    const perProject = computeProjectContributions({ commits, roster });

    expect(perMember.anton1rsod?.projectCommits).toBe(1);
    expect(perProject.foo).toEqual([{ handle: "anton1rsod", commits: 1 }]);
  });
});
