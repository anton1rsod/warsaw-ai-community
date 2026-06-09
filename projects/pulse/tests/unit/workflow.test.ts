import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const yml = readFileSync(path.join(__dirname, "../../../../.github/workflows/pulse.yml"), "utf8");

describe("pulse.yml structural invariants (spec L6/§10.3)", () => {
  it("queues, never cancels in-progress (no partial writes)", () => {
    expect(yml).toMatch(/group:\s*pulse/);
    expect(yml).toMatch(/cancel-in-progress:\s*false/);
  });
  it("all crons run at :30 (off the top-of-hour peak)", () => {
    const crons = [...yml.matchAll(/cron:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]!);
    expect(crons.length).toBeGreaterThanOrEqual(2);
    for (const c of crons) expect(c.startsWith("30 ")).toBe(true);
  });
  it("is push-triggered with a data-file path filter and workflow_dispatch", () => {
    expect(yml).toMatch(/workflow_dispatch:/);
    expect(yml).toMatch(/PROJECTS\.md/);
    expect(yml).toMatch(/docs\/decisions\//);
    expect(yml).toMatch(/lib\/__generated__/);
  });
  it("write-back commits carry [skip ci] (no self-trigger loop)", () => {
    expect(yml).toContain("[skip ci]");
  });
  it("guards write-back git add against not-yet-created generated files", () => {
    // Generated artifacts don't exist until a live run; `git add` of a missing
    // pathspec is a fatal exit-128 under bash -e, which aborts the commit-back
    // step before the "no changes" diff guard. Each must be gated on existence
    // so dormant runs (and first runs) stay green.
    expect(yml).toContain("[ -f projects/pulse/notion-index.json ]");
    expect(yml).toContain("[ -f projects/pulse/snapshots/tasks-snapshot.json ]");
  });
  it("uses two separate tokens (least-privilege)", () => {
    expect(yml).toContain("NOTION_TOKEN");
    expect(yml).toContain("NOTION_READ_TOKEN");
  });
  it("notifies on failure", () => {
    expect(yml).toMatch(/if:\s*failure\(\)/);
  });
});
