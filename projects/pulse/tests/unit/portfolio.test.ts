import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parsePortfolio } from "../../lib/sources/portfolio.js";

const fixture = readFileSync(path.join(__dirname, "../fixtures/PROJECTS.sample.md"), "utf8");

describe("parsePortfolio", () => {
  it("parses each active-portfolio row into a typed Project", () => {
    const projects = parsePortfolio(fixture);
    expect(projects).toHaveLength(2);
    expect(projects[0]).toEqual({
      slug: "gbrain",
      name: "GBrain",
      path: "projects/gbrain/",
      status: "Building",
      dri: "Anton",
      version: "v0.1.2",
      currentFocus: "E3 finalization",
      nextGate: "v0.2.0 soft launch",
    });
    expect(projects[1]!.slug).toBe("community-platform");
    expect(projects[1]!.version).toBe("v0.10.0.1");
  });

  it("tolerates a parenthetical status like **Live (v1)**", () => {
    const withParen = fixture.replace("**Live** — v0.10.0.1", "**Live (v1)** — v0.10.0.1");
    expect(parsePortfolio(withParen)[1]!.status).toBe("Live");
  });

  it("throws when a row has no recognized status (fail-fast, L8)", () => {
    const bad = fixture.replace("**Building** — v0.1.2 in flight", "in progress");
    expect(() => parsePortfolio(bad)).toThrow(/status/i);
  });

  it("throws when the Active portfolio section is missing", () => {
    expect(() => parsePortfolio("# Projects\n\nno table here")).toThrow(/Active portfolio/i);
  });
});
