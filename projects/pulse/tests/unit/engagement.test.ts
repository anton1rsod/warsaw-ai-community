import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  parseRoster,
  ContributionsFileSchema,
  KudosFileSchema,
  EventRostersFileSchema,
  buildEngagement,
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
});
