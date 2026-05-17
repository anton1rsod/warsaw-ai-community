import { describe, expect, it } from "vitest";
import { validateEventsFolders, type ValidationResult } from "@/scripts/validate-events-folders";

describe("H44: events folder pattern", () => {
  it("accepts YYYY-MM-DD-kebab/", () => {
    const r: ValidationResult = validateEventsFolders([
      { name: "2026-06-15-ai-hackathon-kickoff", isDirectory: true },
      { name: "_template", isDirectory: true },
      { name: ".DS_Store", isDirectory: false },
      { name: "README.md", isDirectory: false },
    ]);
    expect(r.errors).toEqual([]);
    expect(r.validFolders).toEqual(["2026-06-15-ai-hackathon-kickoff"]);
  });

  it("rejects malformed folder names", () => {
    const r = validateEventsFolders([
      { name: "no-date-prefix", isDirectory: true },
      { name: "2026-13-15-bad-month", isDirectory: true },
      { name: "2026-06-15-UPPER", isDirectory: true },
    ]);
    expect(r.errors.length).toBe(3);
    expect(r.errors[0]).toMatch(/no-date-prefix/);
  });

  it("ignores non-directory entries", () => {
    const r = validateEventsFolders([
      { name: "not-a-valid-slug", isDirectory: false },
      { name: "README.md", isDirectory: false },
    ]);
    expect(r.errors).toEqual([]);
    expect(r.validFolders).toEqual([]);
  });

  it("ignores underscore-prefixed directories (reserved / template)", () => {
    const r = validateEventsFolders([
      { name: "_template", isDirectory: true },
      { name: "_archive", isDirectory: true },
    ]);
    expect(r.errors).toEqual([]);
    expect(r.validFolders).toEqual([]);
  });

  it("ignores dot-prefixed directories (.git, .DS_Store folder)", () => {
    const r = validateEventsFolders([
      { name: ".hidden", isDirectory: true },
    ]);
    expect(r.errors).toEqual([]);
    expect(r.validFolders).toEqual([]);
  });

  it("returns empty result for empty input", () => {
    const r = validateEventsFolders([]);
    expect(r.errors).toEqual([]);
    expect(r.validFolders).toEqual([]);
  });

  it("rejects a calendar-invalid date like 2026-02-30", () => {
    const r = validateEventsFolders([
      { name: "2026-02-30-impossible-date", isDirectory: true },
    ]);
    expect(r.errors.length).toBe(1);
    expect(r.errors[0]).toMatch(/2026-02-30-impossible-date/);
  });

  it("accepts multiple valid folders and collects multiple errors", () => {
    const r = validateEventsFolders([
      { name: "2026-06-15-first-event", isDirectory: true },
      { name: "2026-07-20-second-event", isDirectory: true },
      { name: "bad-folder", isDirectory: true },
      { name: "2026-99-01-bad-month", isDirectory: true },
    ]);
    expect(r.validFolders).toEqual(["2026-06-15-first-event", "2026-07-20-second-event"]);
    expect(r.errors.length).toBe(2);
  });
});
