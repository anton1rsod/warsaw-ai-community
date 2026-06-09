import { describe, it, expect } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseRootState, loadRootState } from "../../lib/sources/states.js";

const fixture = readFileSync(path.join(__dirname, "../fixtures/STATE.sample.md"), "utf8");

describe("parseRootState", () => {
  it("extracts lastUpdated, drivers, hotNow, and normalizes 'None.' blockers to []", () => {
    const s = parseRootState(fixture);
    expect(s.lastUpdated).toBe("2026-06-09");
    expect(s.drivers).toEqual([
      { name: "Anton", role: "DRI", detail: "gbrain · community-platform · `pulse`." },
      { name: "Yuriy", role: "peer co-founder", detail: "community ops — onboarding." },
    ]);
    expect(s.hotNow).toHaveLength(2);
    expect(s.hotNow[0]).toContain("spec APPROVED");
    expect(s.blockers).toEqual([]);
  });

  it("keeps real blockers", () => {
    const s = parseRootState(fixture.replace("- None.", "- Waiting on Notion setup."));
    expect(s.blockers).toEqual(["Waiting on Notion setup."]);
  });

  it("returns empty arrays when sections are missing (sectionLines → [])", () => {
    // Content with no ## headings at all — all sectionLines calls return []
    const s = parseRootState("**Last updated:** 2026-01-01");
    expect(s.drivers).toEqual([]);
    expect(s.hotNow).toEqual([]);
    expect(s.blockers).toEqual([]);
  });

  it("sectionLines returns remaining lines when no trailing ## exists", () => {
    // Only 'Hot now' with content and no following ## heading
    const content = "**Last updated:** 2026-01-01\n## Hot now\n- item one\n- item two";
    const s = parseRootState(content);
    expect(s.hotNow).toEqual(["item one", "item two"]);
  });

  it("skips driver bullets that do not match **Name (role):** pattern", () => {
    const content = [
      "**Last updated:** 2026-01-01",
      "## Active drivers",
      "- **Anton (DRI):** works on pulse.",
      "- plain text without bold pattern",
      "## Hot now",
      "- ship",
      "## Blockers",
      "- None.",
    ].join("\n");
    const s = parseRootState(content);
    // Only the matching driver is included; the plain text bullet is skipped
    expect(s.drivers).toHaveLength(1);
    expect(s.drivers[0]!.name).toBe("Anton");
  });

  it("driver with no trailing detail defaults detail to empty string", () => {
    // **Name (role):** with nothing after the colon — m[3] is undefined, ?? "" kicks in
    const content = [
      "**Last updated:** 2026-02-01",
      "## Active drivers",
      "- **Maria (PM):**",
      "## Hot now",
      "## Blockers",
      "- None.",
    ].join("\n");
    const s = parseRootState(content);
    expect(s.drivers).toHaveLength(1);
    expect(s.drivers[0]!.detail).toBe("");
  });

  it("lastUpdated defaults to empty string when no Last updated line", () => {
    const s = parseRootState("## Hot now\n- item\n## Active drivers\n## Blockers\n- None.");
    expect(s.lastUpdated).toBe("");
  });

  it("normalizes 'none' (no trailing dot) blockers to []", () => {
    const s = parseRootState(fixture.replace("- None.", "- None"));
    expect(s.blockers).toEqual([]);
  });
});

describe("loadRootState", () => {
  it("throws when root STATE.md is absent", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-states-"));
    try {
      await expect(loadRootState(root)).rejects.toThrow("root STATE.md not found");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("parses when STATE.md exists", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "pulse-states-"));
    try {
      await writeFile(path.join(root, "STATE.md"), fixture);
      const s = await loadRootState(root);
      expect(s.lastUpdated).toBe("2026-06-09");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
