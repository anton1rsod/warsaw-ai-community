import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readRoster, lookupMemberByHandle } from "@/lib/roster";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(
  __dirname,
  "../fixtures/repo/community/members/roster.md",
);

describe("readRoster", () => {
  it("parses members across multiple tables, skipping *(TBD)* rows and empty handles", async () => {
    const roster = await readRoster(FIXTURE);
    expect(roster).toHaveLength(3);
    expect(roster.map((m) => m.githubHandle)).toEqual([
      "anton1rsod",
      "alice-ex",
      "bob-sample",
    ]);
  });

  it("normalizes handles (strips @, lowercases, trims)", async () => {
    const roster = await readRoster(FIXTURE);
    expect(
      roster.find((m) => m.name === "Anton Safronov")?.githubHandle,
    ).toBe("anton1rsod");
    expect(roster.find((m) => m.name === "Bob Sample")?.githubHandle).toBe(
      "bob-sample",
    );
  });

  it("computes deterministic slug from name", async () => {
    const roster = await readRoster(FIXTURE);
    expect(
      roster.find((m) => m.githubHandle === "anton1rsod")?.slug,
    ).toBe("anton-safronov");
    expect(roster.find((m) => m.githubHandle === "alice-ex")?.slug).toBe(
      "alice-example",
    );
  });

  it("excludes *(TBD)* Name rows (§9.1 amendment)", async () => {
    const roster = await readRoster(FIXTURE);
    expect(roster.some((m) => m.name.includes("(TBD)"))).toBe(false);
  });

  it("excludes rows whose GitHub cell is empty", async () => {
    const roster = await readRoster(FIXTURE);
    // The two TBD rows have empty GitHub cells; verify count reflects exclusion.
    expect(roster).toHaveLength(3);
  });

  it("excludes rows whose handle normalizes to 'tbd'", async () => {
    const roster = await readRoster(FIXTURE);
    expect(roster.some((m) => m.githubHandle === "tbd")).toBe(false);
    expect(roster.some((m) => m.name === "Carol Pending")).toBe(false);
  });
});

describe("lookupMemberByHandle", () => {
  it("looks up case-insensitively", async () => {
    const roster = await readRoster(FIXTURE);
    expect(lookupMemberByHandle(roster, "Anton1RSOD")?.name).toBe(
      "Anton Safronov",
    );
  });

  it("strips a leading @ before looking up", async () => {
    const roster = await readRoster(FIXTURE);
    expect(lookupMemberByHandle(roster, "@alice-ex")?.name).toBe(
      "Alice Example",
    );
  });

  it("returns undefined for unknown handle", async () => {
    const roster = await readRoster(FIXTURE);
    expect(lookupMemberByHandle(roster, "stranger")).toBeUndefined();
  });

  it("returns undefined for empty handle", async () => {
    const roster = await readRoster(FIXTURE);
    expect(lookupMemberByHandle(roster, "")).toBeUndefined();
  });
});
