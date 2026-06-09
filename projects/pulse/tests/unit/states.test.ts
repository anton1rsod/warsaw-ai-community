import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseRootState } from "../../lib/sources/states.js";

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
});
