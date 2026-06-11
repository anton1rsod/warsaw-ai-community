import { describe, it, expect } from "vitest";
import { parseRosterContent } from "@/lib/roster";

// Mirrors the REAL community/members/roster.md two-table layout:
// Core organizers has a Role column and NO Link column; the founder's
// Telegram cell is "@antonsafronov (TBD)" (annotated-TBD → null).
const REAL_SHAPE = `# Member Roster

## Core organizers

| Name | GitHub | Role | Telegram | Focus |
|---|---|---|---|---|
| Anton Safronov | @anton1rsod | Founder / BDFL | @antonsafronov (TBD) | Direction, gbrain lead |
| Yuriy *(surname TBD)* | *(TBD)* | Co-founder (peer) | *(TBD)* | Community ops |

## Members (opt-in)

| Name | GitHub | Telegram | Link | Focus |
|---|---|---|---|---|
| Mark Spasonov | @markspas |  | https://www.linkedin.com/in/markspas/ | RevOps / AI-augmented sales ops |
| Jane Handle | @janeh | @jane_h | | |
| Tibor Caser | @tibor | tbd | TBD |  |
`;

describe("v0.12 roster columns — Telegram / Link / Focus", () => {
  const members = parseRosterContent(REAL_SHAPE);
  const anton = members.find((m) => m.githubHandle === "anton1rsod");
  const mark = members.find((m) => m.githubHandle === "markspas");
  const jane = members.find((m) => m.githubHandle === "janeh");
  const tibor = members.find((m) => m.githubHandle === "tibor");

  it("existing 3 fields are unchanged", () => {
    expect(anton?.name).toBe("Anton Safronov");
    expect(anton?.githubHandle).toBe("anton1rsod");
    expect(anton?.slug).toBe("anton-safronov");
    expect(members.map((m) => m.githubHandle)).toEqual([
      "anton1rsod",
      "markspas",
      "janeh",
      "tibor",
    ]);
  });

  it("Core organizers (no Link column): link is null; TBD-annotated telegram is null", () => {
    expect(anton?.telegram).toBeNull(); // "@antonsafronov (TBD)" → null
    expect(anton?.link).toBeNull(); // table has no Link column
    expect(anton?.focus).toBe("Direction, gbrain lead");
  });

  it("Members table: empty telegram → null, link + focus carried through", () => {
    expect(mark?.telegram).toBeNull();
    expect(mark?.link).toBe("https://www.linkedin.com/in/markspas/");
    expect(mark?.focus).toBe("RevOps / AI-augmented sales ops");
  });

  it("present telegram is carried verbatim; empty link/focus → null", () => {
    expect(jane?.telegram).toBe("@jane_h");
    expect(jane?.link).toBeNull();
    expect(jane?.focus).toBeNull();
  });

  it("TBD is case-insensitive in every optional cell", () => {
    expect(tibor?.telegram).toBeNull(); // "tbd"
    expect(tibor?.link).toBeNull(); // "TBD"
    expect(tibor?.focus).toBeNull(); // empty
  });

  it("a table lacking all three columns yields nulls", () => {
    const minimal = "| Name | GitHub |\n|---|---|\n| Solo Person | @solo |\n";
    const m = parseRosterContent(minimal)[0];
    expect(m?.telegram).toBeNull();
    expect(m?.link).toBeNull();
    expect(m?.focus).toBeNull();
  });

  // Reviewer triage: member.link renders as a raw href on the member page
  // (React does not strip javascript:/data: schemes from href) — only
  // http(s) URLs survive parse; everything else degrades to null.
  it("link cell accepts only http(s) URLs — scheme guard", () => {
    const table = (link: string): string =>
      `| Name | GitHub | Telegram | Link | Focus |\n|---|---|---|---|---|\n| Eve Mallory | @eve | | ${link} | |\n`;
    expect(parseRosterContent(table("https://eve.dev"))[0]?.link).toBe(
      "https://eve.dev",
    );
    expect(parseRosterContent(table("http://eve.dev"))[0]?.link).toBe(
      "http://eve.dev",
    );
    expect(parseRosterContent(table("javascript:alert(1)"))[0]?.link).toBeNull();
    expect(
      parseRosterContent(table("data:text/html,<script>1</script>"))[0]?.link,
    ).toBeNull();
    expect(parseRosterContent(table("not a url"))[0]?.link).toBeNull();
  });
});
