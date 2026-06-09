import { describe, it, expect } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parsePortfolio, loadPortfolio } from "../../lib/sources/portfolio.js";

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

  it("throws when a data row has fewer than 6 cells", () => {
    const short = [
      "## Active portfolio",
      "| Project | Path | Status | Lead |",
      "| --- | --- | --- | --- |",
      "| [GBrain](r) | `projects/gbrain/` | **Building** | Anton |",
    ].join("\n");
    expect(() => parsePortfolio(short)).toThrow("row has <6 cells");
  });

  it("throws when the project name link cannot be parsed from the first cell", () => {
    // Row has 6 cells but first cell has no [Name](...) markdown link
    const noLink = [
      "## Active portfolio",
      "| Project | Path | Status | Lead | Focus | Gate |",
      "| --- | --- | --- | --- | --- | --- |",
      "| GBrain (no link) | `projects/gbrain/` | **Building** — v0.1.2 | Anton | E3 | v0.2.0 |",
    ].join("\n");
    expect(() => parsePortfolio(noLink)).toThrow("cannot parse project name");
  });

  it("throws when the Active portfolio table has no data rows", () => {
    const empty = [
      "## Active portfolio",
      "| Project | Path | Status | Lead | Focus | Gate |",
      "| --- | --- | --- | --- | --- | --- |",
    ].join("\n");
    expect(() => parsePortfolio(empty)).toThrow("no data rows");
  });

  it("parses a project with no version match (version defaults to empty string)", () => {
    // Replace the version part with something that has no v0.x.y pattern
    const noVersion = fixture.replace("**Building** — v0.1.2 in flight", "**Building** — in flight");
    const projects = parsePortfolio(noVersion);
    expect(projects[0]!.version).toBe("");
  });
});

describe("loadPortfolio", () => {
  it("throws when PROJECTS.md is absent", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-portfolio-"));
    try {
      await expect(loadPortfolio(root)).rejects.toThrow("PROJECTS.md not found");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("parses when PROJECTS.md exists", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-portfolio-"));
    try {
      await writeFile(path.join(root, "PROJECTS.md"), fixture);
      const projects = await loadPortfolio(root);
      expect(projects).toHaveLength(2);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
