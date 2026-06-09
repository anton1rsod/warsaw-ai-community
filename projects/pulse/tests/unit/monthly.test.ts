import { describe, it, expect } from "vitest";
import { buildMonthlyReview, type MonthlyReviewInput } from "../../lib/reports/monthly.js";

const input: MonthlyReviewInput = {
  period: "2026-05",
  generatedAt: "2026-06-01T09:30:00.000Z",
  projects: [
    { slug: "gbrain", name: "GBrain", path: "projects/gbrain/", status: "Building", dri: "Anton", version: "v0.1.2", currentFocus: "E3", nextGate: "v0.2.0" },
  ],
  releases: [
    { project: "community-platform", version: "0.10.0.1", date: "2026-05-31", summary: "hotfix" },
    { project: "gbrain", version: "0.1.0", date: "2026-04-26", summary: "scaffold" },
  ],
  decisions: [
    { id: "0016", adr: "ADR-0016", title: "Telegram echo", status: "Proposed", date: "2026-05-28", path: "docs/decisions/0016-x.md" },
    { id: "0001", adr: "ADR-0001", title: "OSS-first", status: "Accepted", date: "2026-04-24", path: "docs/decisions/0001-x.md" },
  ],
  engagement: [
    { handle: "markspas", name: "Mark", contributions: 0, kudos: 0, statusStreak: 0, eventsAttended: 0 },
    { handle: "anton1rsod", name: "Anton", contributions: 385, kudos: 3, statusStreak: 2, eventsAttended: 1 },
  ],
  state: { lastUpdated: "2026-06-01", drivers: [{ name: "Anton", role: "DRI", detail: "all" }], hotNow: ["ship pulse"], blockers: [] },
};

describe("buildMonthlyReview", () => {
  it("titles by month and includes only in-period releases + decisions", () => {
    const md = buildMonthlyReview(input);
    expect(md).toContain("# Monthly Review — May 2026");
    expect(md).toContain("0.10.0.1"); // May release present
    expect(md).not.toContain("scaffold"); // April release excluded
    expect(md).toContain("ADR-0016"); // May decision present
    expect(md).not.toContain("OSS-first"); // April decision excluded
  });

  it("sorts engagement by contributions desc", () => {
    const md = buildMonthlyReview(input);
    expect(md.indexOf("Anton")).toBeLessThan(md.indexOf("Mark"));
  });

  it("renders empty-states and 'None' blockers", () => {
    const md = buildMonthlyReview({ ...input, releases: [], state: { ...input.state, blockers: [] } });
    expect(md).toContain("_No releases this month._");
    expect(md).toContain("_None._");
  });

  it("renders '_No decisions this month.' when no decisions match the period", () => {
    const md = buildMonthlyReview({ ...input, decisions: [] });
    expect(md).toContain("_No decisions this month._");
  });

  it("renders '_None recorded.' when drivers list is empty", () => {
    const md = buildMonthlyReview({ ...input, state: { ...input.state, drivers: [], hotNow: [] } });
    expect(md).toContain("_None recorded._");
    expect(md).toContain("_Nothing flagged._");
  });

  it("monthLabel falls back to raw month segment when MONTHS index is out of range", () => {
    // A period with month "13" has no entry in MONTHS array → fallback to "13"
    const md = buildMonthlyReview({ ...input, period: "2026-13" });
    expect(md).toContain("13 2026");
  });
});
