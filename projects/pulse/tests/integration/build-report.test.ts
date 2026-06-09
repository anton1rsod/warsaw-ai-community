import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, mkdir, writeFile, rm, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { gatherMonthlyInput } from "../../scripts/build-report.js";

const FX = path.join(__dirname, "../fixtures");
let root: string;

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "pulse-repo-"));
  await mkdir(path.join(root, "docs/decisions"), { recursive: true });
  await mkdir(path.join(root, "projects/demo"), { recursive: true });
  await mkdir(path.join(root, "projects/community-platform/lib/__generated__"), { recursive: true });
  await mkdir(path.join(root, "community/members"), { recursive: true });
  await mkdir(path.join(root, "community/status/2026-W18"), { recursive: true });
  await cp(path.join(FX, "PROJECTS.sample.md"), path.join(root, "PROJECTS.md"));
  await cp(path.join(FX, "STATE.sample.md"), path.join(root, "STATE.md"));
  await cp(path.join(FX, "decisions-README.sample.md"), path.join(root, "docs/decisions/README.md"));
  await cp(path.join(FX, "CHANGELOG.sample.md"), path.join(root, "projects/demo/CHANGELOG.md"));
  await cp(path.join(FX, "roster.sample.md"), path.join(root, "community/members/roster.md"));
  const gen = path.join(root, "projects/community-platform/lib/__generated__");
  await cp(path.join(FX, "contributions.sample.json"), path.join(gen, "contributions.json"));
  await cp(path.join(FX, "kudos.sample.json"), path.join(gen, "kudos.json"));
  await cp(path.join(FX, "event-rosters.sample.json"), path.join(gen, "event-rosters.json"));
  await writeFile(path.join(root, "community/status/2026-W18/anton-safronov.md"),
    "---\nweek: 2026-W18\nauthor: anton1rsod\n---\nhi");
});
afterAll(async () => { await rm(root, { recursive: true, force: true }); });

describe("gatherMonthlyInput (loader wiring)", () => {
  it("loads every source from a fixture repo into a MonthlyReviewInput", async () => {
    const input = await gatherMonthlyInput(root, "2026-05", "2026-06-01T00:00:00.000Z");
    expect(input.projects.map((p) => p.slug)).toContain("gbrain");
    expect(input.decisions.find((d) => d.adr === "ADR-0017")).toBeTruthy();
    expect(input.releases.find((r) => r.version === "0.10.0.1")).toBeTruthy();
    expect(input.engagement.find((e) => e.handle === "anton1rsod")?.statusStreak).toBe(1);
  });
});
