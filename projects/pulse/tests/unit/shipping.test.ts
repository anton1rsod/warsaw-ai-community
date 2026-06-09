import { describe, it, expect } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseChangelog, parseTagSet, loadReleases } from "../../lib/sources/shipping.js";

const fixture = readFileSync(path.join(__dirname, "../fixtures/CHANGELOG.sample.md"), "utf8");

describe("parseChangelog", () => {
  it("extracts only semver releases, both dash styles, with clean summaries", () => {
    const releases = parseChangelog(fixture, "demo");
    expect(releases).toHaveLength(2); // Unreleased + Versioning policy excluded
    expect(releases[0]).toEqual({
      project: "demo",
      version: "0.10.0.1",
      date: "2026-05-31",
      summary: "chat-52 followup — serialization hotfix; H122",
    });
    expect(releases[1]).toEqual({
      project: "demo",
      version: "0.1.1",
      date: "2026-04-26",
      summary: "rehearsal complete + Gemini direct",
    });
  });

  it("skips [Unreleased] and headings without a date", () => {
    const content = [
      "## [Unreleased] — 2026-06-10",
      "## [0.2.0] no date here",
      "## [0.1.0] — 2026-01-15 — first release",
    ].join("\n");
    const releases = parseChangelog(content, "proj");
    // [Unreleased] skipped (non-semver); [0.2.0] skipped (no date); only [0.1.0] passes
    expect(releases).toHaveLength(1);
    expect(releases[0]!.version).toBe("0.1.0");
    expect(releases[0]!.summary).toBe("first release");
  });

  it("cleanSummary handles em-dash and hyphen prefix styles", () => {
    // em-dash separator — summary after
    const emDash = "## [1.0.0] — 2026-03-01 — my feature";
    const hyphen = "## [2.0.0] - 2026-03-02 - another feature";
    const [r1, r2] = parseChangelog([emDash, hyphen].join("\n"), "x");
    expect(r1!.summary).toBe("my feature");
    expect(r2!.summary).toBe("another feature");
  });
});

describe("parseTagSet", () => {
  it("maps `<slug>-v<version>` tag lines into a project@version set", () => {
    const set = parseTagSet(["community-platform-v0.10.0.1", "gbrain-v0.1.1", "not-a-tag"]);
    expect(set.has("community-platform@0.10.0.1")).toBe(true);
    expect(set.has("gbrain@0.1.1")).toBe(true);
    expect(set.size).toBe(2);
  });

  it("ignores lines that do not match the slug-v<version> pattern", () => {
    const set = parseTagSet(["bare-word", "  ", "", "gbrain-v1.0.0"]);
    expect(set.size).toBe(1);
    expect(set.has("gbrain@1.0.0")).toBe(true);
  });
});

describe("loadReleases", () => {
  it("returns [] when the projects/ directory does not exist", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-shipping-"));
    try {
      const releases = await loadReleases(root);
      expect(releases).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("skips _ prefixed directories and parses CHANGELOG.md in real dirs", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-shipping-"));
    try {
      await mkdir(path.join(root, "projects/_template"), { recursive: true });
      await writeFile(
        path.join(root, "projects/_template/CHANGELOG.md"),
        "## [1.0.0] — 2026-01-01 — should be skipped",
      );
      await mkdir(path.join(root, "projects/myproject"), { recursive: true });
      await writeFile(
        path.join(root, "projects/myproject/CHANGELOG.md"),
        "## [0.1.0] — 2026-02-01 — real release",
      );
      const releases = await loadReleases(root);
      expect(releases).toHaveLength(1);
      expect(releases[0]!.project).toBe("myproject");
      expect(releases[0]!.version).toBe("0.1.0");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("skips project dirs without a CHANGELOG.md", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-shipping-"));
    try {
      await mkdir(path.join(root, "projects/no-changelog"), { recursive: true });
      const releases = await loadReleases(root);
      expect(releases).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
