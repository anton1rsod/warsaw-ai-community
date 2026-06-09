import { describe, it, expect } from "vitest";
import { parseRosterContent, lookupMemberByHandle } from "@/lib/roster";

const ROSTER = `# Roster

## Members (opt-in)

| Name | GitHub | Telegram | Link | Focus |
|---|---|---|---|---|
| Anton Safronov | @anton1rsod | @anton | | founder |
`;

describe("parseRosterContent (string-based; powers the live dup-handle guard)", () => {
  it("parses members from raw content", () => {
    const members = parseRosterContent(ROSTER);
    expect(members).toHaveLength(1);
    expect(members[0]?.githubHandle).toBe("anton1rsod");
  });
  it("lookupMemberByHandle finds by normalized handle", () => {
    expect(lookupMemberByHandle(parseRosterContent(ROSTER), "@ANTON1RSOD")?.slug).toBe("anton-safronov");
    expect(lookupMemberByHandle(parseRosterContent(ROSTER), "ghost")).toBeUndefined();
  });
});
