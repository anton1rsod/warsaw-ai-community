import { describe, it, expect } from "vitest";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseDecisions, loadDecisions } from "../../lib/sources/decisions.js";

const fixture = readFileSync(path.join(__dirname, "../fixtures/decisions-README.sample.md"), "utf8");

describe("parseDecisions", () => {
  it("parses each index row into a typed Adr", () => {
    const adrs = parseDecisions(fixture);
    expect(adrs).toHaveLength(3);
    expect(adrs[0]).toEqual({
      id: "0001",
      adr: "ADR-0001",
      title: "OSS-first licensing",
      status: "Accepted",
      date: "2026-04-24",
      path: "docs/decisions/0001-oss-first-licensing.md",
    });
    expect(adrs[1]!.status).toBe("Proposed");
  });

  it("throws on an unrecognized status (fail-fast)", () => {
    const bad = fixture.replace("| Accepted | 2026-04-24 |", "| Maybe | 2026-04-24 |");
    expect(() => parseDecisions(bad)).toThrow();
  });

  it("throws 'no ADR index rows found' on empty content", () => {
    expect(() => parseDecisions("")).toThrow("no ADR index rows found");
    expect(() => parseDecisions("# ADRs\n\nno table here")).toThrow("no ADR index rows found");
  });

  it("throws 'bad index row' when a matching row lacks the (file.md) link", () => {
    // Row matches the regex (first cell is [NNNN]...) but has no (file.md) reference
    const badRow = "| [0002] | Missing link | Accepted | 2026-01-01 |";
    expect(() => parseDecisions(badRow)).toThrow("bad index row");
  });

  it("uses empty-string fallbacks for missing title/status/date cells in a sparse row", () => {
    // A row with exactly [NNNN](file.md) in the first cell but no further cells
    // This covers the c[1] ?? "", c[2] ?? "", c[3] ?? "" branches — Zod will reject
    // because status "" is not a valid ProjectStatus, so expect a throw
    const sparseRow = "| [0003](0003-test.md) |";
    expect(() => parseDecisions(sparseRow)).toThrow();
  });
});

describe("loadDecisions", () => {
  it("throws when docs/decisions/README.md is absent", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-decisions-"));
    try {
      await expect(loadDecisions(root)).rejects.toThrow("docs/decisions/README.md not found");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("parses when file exists", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-decisions-"));
    try {
      await mkdir(path.join(root, "docs/decisions"), { recursive: true });
      writeFileSync(path.join(root, "docs/decisions/README.md"), fixture);
      const adrs = await loadDecisions(root);
      expect(adrs).toHaveLength(3);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
