import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readRoster,
  lookupMemberByHandle,
  readMemberProfile,
  readMemberPersona,
  appendMember,
} from "@/lib/roster";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(
  __dirname,
  "../fixtures/repo/community/members/roster.md",
);
const REPO_ROOT = path.resolve(__dirname, "../fixtures/repo");

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

describe("readMemberProfile", () => {
  it("returns body and frontmatter when file exists", async () => {
    const profile = await readMemberProfile(REPO_ROOT, "anton-safronov");
    expect(profile?.body).toContain("Founder");
    expect(profile?.data.consented_at).toBe("2026-05-01T10:00:00Z");
  });

  it("returns null when file is absent", async () => {
    expect(await readMemberProfile(REPO_ROOT, "ghost")).toBeNull();
  });

  it("rejects path traversal", async () => {
    expect(await readMemberProfile(REPO_ROOT, "../etc")).toBeNull();
    expect(await readMemberProfile(REPO_ROOT, "foo/bar")).toBeNull();
    expect(await readMemberProfile(REPO_ROOT, "foo\\bar")).toBeNull();
  });
});

describe("readMemberPersona", () => {
  it("returns persona truncated to first H2", async () => {
    const persona = await readMemberPersona(REPO_ROOT, "anton-safronov");
    expect(persona).toContain("# Anton Safronov");
    expect(persona).toContain("PM-minded");
    expect(persona).not.toContain("## Skills");
  });

  it("returns null when persona dir absent", async () => {
    expect(await readMemberPersona(REPO_ROOT, "ghost")).toBeNull();
  });

  it("rejects path traversal", async () => {
    expect(await readMemberPersona(REPO_ROOT, "../persona")).toBeNull();
    expect(await readMemberPersona(REPO_ROOT, "foo/bar")).toBeNull();
    expect(await readMemberPersona(REPO_ROOT, "foo\\bar")).toBeNull();
  });
});

const ROSTER_BEFORE_MIGRATION = `# Member Roster

**Count:** 1

## Core organizers

| Name | GitHub | Role | Telegram | Focus |
|---|---|---|---|---|
| Anton Safronov | @anton1rsod | Founder / BDFL | @antonsafronov | Direction |

## Members (opt-in)

| Name | GitHub | Telegram | Link | Focus |
|---|---|---|---|---|
| Mark Spasonov | @markspas |  | https://example.com | RevOps |

## Notes

- N/A
`;

describe("appendMember — adds row to 5-col Members table (snapshot)", () => {
  it("appends a row with all fields populated", () => {
    const out = appendMember(ROSTER_BEFORE_MIGRATION, {
      name: "New Member",
      githubHandle: "newmember",
      telegram: "@newmember",
      link: "https://newmember.example",
      focus: "Frontend",
    });
    expect(out).toMatchSnapshot();
  });
  it("appends a row with optional link + focus empty", () => {
    const out = appendMember(ROSTER_BEFORE_MIGRATION, {
      name: "Minimal Member",
      githubHandle: "minimal",
      telegram: "@minimal",
      link: "",
      focus: "",
    });
    expect(out).toMatchSnapshot();
  });
  it("escapes pipes in name + focus", () => {
    const out = appendMember(ROSTER_BEFORE_MIGRATION, {
      name: "Anton | Founder",
      githubHandle: "anton1rsod",
      telegram: "@antonsafronov",
      link: "",
      focus: "AI | infra",
    });
    expect(out).toContain("Anton &#124; Founder");
    expect(out).toContain("AI &#124; infra");
  });
  it("inserts the row INSIDE the Members table (not after the file)", () => {
    const out = appendMember(ROSTER_BEFORE_MIGRATION, {
      name: "Inserted",
      githubHandle: "inserted",
      telegram: "@inserted",
      link: "",
      focus: "",
    });
    const insertPos = out.indexOf("Inserted");
    const notesPos = out.indexOf("## Notes");
    expect(insertPos).toBeLessThan(notesPos);
    expect(insertPos).toBeGreaterThan(0);
  });
  it("throws when the Members table is absent", () => {
    expect(() =>
      appendMember("# No table here\n", {
        name: "x",
        githubHandle: "x",
        telegram: "@xxxxx",
        link: "",
        focus: "",
      }),
    ).toThrow(/members table not found/i);
  });
});
