import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseDecisions } from "../../lib/sources/decisions.js";

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
    expect(adrs[1].status).toBe("Proposed");
  });

  it("throws on an unrecognized status (fail-fast)", () => {
    const bad = fixture.replace("| Accepted | 2026-04-24 |", "| Maybe | 2026-04-24 |");
    expect(() => parseDecisions(bad)).toThrow();
  });
});
