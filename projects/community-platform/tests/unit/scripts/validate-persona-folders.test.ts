import { describe, expect, it } from "vitest";
import { validatePersonaFolders } from "@/scripts/validate-persona-folders";

describe("H68: persona slug-folder integrity", () => {
  it("passes when every folder maps to a roster slug AND every roster slug has a folder", () => {
    const rosterSlugs = ["anton-safronov", "mark-spasonov"];
    const personaFolders = ["anton-safronov", "mark-spasonov"];
    const result = validatePersonaFolders({ rosterSlugs, personaFolders });
    expect(result.ok).toBe(true);
    expect(result.orphanFolders).toEqual([]);
    expect(result.orphanRosterSlugs).toEqual([]);
  });

  it("fails when a folder has no matching roster slug (orphan folder)", () => {
    const rosterSlugs = ["anton-safronov"];
    const personaFolders = ["anton-safronov", "dmitry-b"];
    const result = validatePersonaFolders({ rosterSlugs, personaFolders });
    expect(result.ok).toBe(false);
    expect(result.orphanFolders).toContain("dmitry-b");
  });

  it("passes (with informational hint) when a roster slug has no folder", () => {
    const rosterSlugs = ["anton-safronov", "new-member"];
    const personaFolders = ["anton-safronov"];
    const result = validatePersonaFolders({ rosterSlugs, personaFolders });
    expect(result.ok).toBe(true);
    expect(result.orphanRosterSlugs).toContain("new-member");
  });

  it("returns a structured result the CLI wrapper translates to an exit code", () => {
    const result = validatePersonaFolders({
      rosterSlugs: ["a"],
      personaFolders: ["a", "b"],
    });
    expect(result.ok).toBe(false);
    expect(typeof result.ok).toBe("boolean");
  });
});
