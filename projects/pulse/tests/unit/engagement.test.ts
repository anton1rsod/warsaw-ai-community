import { describe, it, expect } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  parseRoster,
  buildEngagement,
  loadEngagement,
  ContributionsFileSchema,
  KudosFileSchema,
  EventRostersFileSchema,
} from "../../lib/sources/engagement.js";

const fx = (f: string) => readFileSync(path.join(__dirname, "../fixtures", f), "utf8");

describe("parseRoster", () => {
  it("returns members with a real handle + derived slug, skipping (TBD) rows", () => {
    const members = parseRoster(fx("roster.sample.md"));
    expect(members).toEqual([
      { name: "Anton Safronov", handle: "anton1rsod", slug: "anton-safronov" },
      { name: "Mark Spasonov", handle: "markspas", slug: "mark-spasonov" },
    ]);
  });

  it("skips header and separator rows", () => {
    const content = [
      "| Name | GitHub | Role |",
      "| --- | --- | --- |",
      "| Anton | @anton1rsod | Founder |",
    ].join("\n");
    const members = parseRoster(content);
    expect(members).toHaveLength(1);
    expect(members[0]!.handle).toBe("anton1rsod");
  });

  it("skips rows where the GitHub cell has no @handle (e.g. empty or plain text)", () => {
    const content = [
      "| Name | GitHub | Role |",
      "| --- | --- | --- |",
      "| No Handle | no-at-sign | Viewer |",
      "| Real Member | @realhandle | Member |",
    ].join("\n");
    const members = parseRoster(content);
    expect(members).toHaveLength(1);
    expect(members[0]!.handle).toBe("realhandle");
  });

  it("skips rows with fewer than 2 cells", () => {
    const content = "| | |   |\n| one-cell-only |\n| Name | @myhandle | Role |";
    const members = parseRoster(content);
    expect(members).toHaveLength(1);
    expect(members[0]!.handle).toBe("myhandle");
  });
});

describe("buildEngagement", () => {
  it("computes the four locked metrics per member", () => {
    const members = parseRoster(fx("roster.sample.md"));
    const contributions = ContributionsFileSchema.parse(JSON.parse(fx("contributions.sample.json")));
    const kudos = KudosFileSchema.parse(JSON.parse(fx("kudos.sample.json")));
    const eventRosters = EventRostersFileSchema.parse(JSON.parse(fx("event-rosters.sample.json")));
    const statusWeeksByHandle = { anton1rsod: ["2026-W17", "2026-W18"] };

    const rows = buildEngagement({ members, contributions, kudos, eventRosters, statusWeeksByHandle });
    expect(rows[0]).toEqual({
      handle: "anton1rsod", name: "Anton Safronov",
      contributions: 385, kudos: 3, statusStreak: 2, eventsAttended: 1,
    });
    expect(rows[1]).toEqual({
      handle: "markspas", name: "Mark Spasonov",
      contributions: 0, kudos: 0, statusStreak: 0, eventsAttended: 0,
    });
  });

  it("ContributionsFileSchema rejects a malformed row (fail-fast)", () => {
    expect(() => ContributionsFileSchema.parse({ x: { projectCommits: "nope" } })).toThrow();
  });

  it("matches event attendance by handle (not just profile slug)", () => {
    const members = [{ name: "Test User", handle: "testhandle", slug: "test-user" }];
    const contributions = ContributionsFileSchema.parse({});
    const kudos = KudosFileSchema.parse({});
    // publicSlugs contains the handle, not the profile slug
    const eventRosters = EventRostersFileSchema.parse({
      "2026-05-01-event": {
        going: { publicSlugs: ["testhandle"], hiddenCount: 0 },
        interested: { publicSlugs: [], hiddenCount: 0 },
      },
    });

    const rows = buildEngagement({ members, contributions, kudos, eventRosters, statusWeeksByHandle: {} });
    expect(rows[0]!.eventsAttended).toBe(1);
  });

  it("defaults missing contributions and kudos to 0", () => {
    const members = [{ name: "New Member", handle: "newmember", slug: "new-member" }];
    const rows = buildEngagement({
      members,
      contributions: ContributionsFileSchema.parse({}),
      kudos: KudosFileSchema.parse({}),
      eventRosters: EventRostersFileSchema.parse({}),
      statusWeeksByHandle: {},
    });
    expect(rows[0]).toEqual({
      handle: "newmember", name: "New Member",
      contributions: 0, kudos: 0, statusStreak: 0, eventsAttended: 0,
    });
  });
});

describe("loadEngagement", () => {
  it("throws when community/members/roster.md is absent", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-engagement-"));
    try {
      await expect(loadEngagement(root)).rejects.toThrow("community/members/roster.md not found");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("processes status files: skips files with no frontmatter author/week", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-engagement-"));
    try {
      // Set up the required roster + generated files
      await mkdir(path.join(root, "community/members"), { recursive: true });
      await mkdir(path.join(root, "community/status/2026-W18"), { recursive: true });
      await mkdir(path.join(root, "projects/community-platform/lib/__generated__"), { recursive: true });

      await writeFile(
        path.join(root, "community/members/roster.md"),
        "| Name | GitHub |\n| --- | --- |\n| Anton | @anton1rsod |",
      );

      // A status file WITHOUT frontmatter (no author/week fields) — should be skipped
      await writeFile(
        path.join(root, "community/status/2026-W18/no-frontmatter.md"),
        "# Status\nNo frontmatter here.",
      );
      // A status file WITH proper frontmatter
      await writeFile(
        path.join(root, "community/status/2026-W18/with-frontmatter.md"),
        "---\nauthor: anton1rsod\nweek: 2026-W18\n---\n# Status\nContent.",
      );

      const gen = path.join(root, "projects/community-platform/lib/__generated__");
      await writeFile(path.join(gen, "contributions.json"), JSON.stringify({ "anton1rsod": { projectCommits: 5, adrsFiled: 0, meetingsAttended: 0, statusPosts: 1 } }));
      await writeFile(path.join(gen, "kudos.json"), JSON.stringify({}));
      await writeFile(path.join(gen, "event-rosters.json"), JSON.stringify({}));

      const rows = await loadEngagement(root);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.handle).toBe("anton1rsod");
      // statusStreak should reflect the 1 week with frontmatter (not 2 — no-frontmatter skipped)
      expect(rows[0]!.statusStreak).toBe(1);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
