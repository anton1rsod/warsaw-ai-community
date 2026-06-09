import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseChangelog, parseTagSet } from "../../lib/sources/shipping.js";

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
});

describe("parseTagSet", () => {
  it("maps `<slug>-v<version>` tag lines into a project@version set", () => {
    const set = parseTagSet(["community-platform-v0.10.0.1", "gbrain-v0.1.1", "not-a-tag"]);
    expect(set.has("community-platform@0.10.0.1")).toBe(true);
    expect(set.has("gbrain@0.1.1")).toBe(true);
    expect(set.size).toBe(2);
  });
});
