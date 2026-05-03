import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseAliases,
  readAliases,
  resolveHandle,
} from "@/lib/git-email-aliases";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("parseAliases", () => {
  it("returns empty map for empty input", () => {
    expect(parseAliases("").size).toBe(0);
  });

  it("parses git email → github handle from a markdown table", () => {
    const md = `# git email aliases

| Git email | GitHub handle |
|---|---|
| anton@rsod.solutions | anton1rsod |
| alice@example.com | alice-ex |
`;
    const aliases = parseAliases(md);
    expect(aliases.size).toBe(2);
    expect(aliases.get("anton@rsod.solutions")).toBe("anton1rsod");
    expect(aliases.get("alice@example.com")).toBe("alice-ex");
  });

  it("normalizes keys and values to lowercase", () => {
    const md = `| Git email | GitHub handle |
|---|---|
| Anton@RSOD.Solutions | Anton1RSOD |
`;
    const aliases = parseAliases(md);
    expect(aliases.size).toBe(1);
    expect(aliases.get("anton@rsod.solutions")).toBe("anton1rsod");
  });

  it("strips a leading @ from handles", () => {
    const md = `| Git email | GitHub handle |
|---|---|
| anton@rsod.solutions | @anton1rsod |
`;
    expect(parseAliases(md).get("anton@rsod.solutions")).toBe("anton1rsod");
  });

  it("skips rows with empty cells or *(TBD)* markers in either column", () => {
    const md = `| Git email | GitHub handle |
|---|---|
| | empty-key |
| missing-handle@example.com | |
| *(TBD)* | someone |
| someone@example.com | *(TBD)* |
| valid@example.com | valid-handle |
`;
    const aliases = parseAliases(md);
    expect(aliases.size).toBe(1);
    expect(aliases.get("valid@example.com")).toBe("valid-handle");
  });

  it("detects the alias table by header columns regardless of column order", () => {
    const md = `| GitHub handle | Notes | Git email |
|---|---|---|
| anton1rsod | founder | anton@rsod.solutions |
`;
    expect(parseAliases(md).get("anton@rsod.solutions")).toBe("anton1rsod");
  });

  it("ignores tables that don't have both required headers", () => {
    const md = `| Name | Role |
|---|---|
| Someone | Founder |

| Git email | GitHub handle |
|---|---|
| anton@rsod.solutions | anton1rsod |
`;
    const aliases = parseAliases(md);
    expect(aliases.size).toBe(1);
    expect(aliases.get("anton@rsod.solutions")).toBe("anton1rsod");
  });
});

describe("resolveHandle", () => {
  const aliases = new Map([["anton@rsod.solutions", "anton1rsod"]]);

  it("returns the aliased handle when the email matches", () => {
    expect(resolveHandle("anton@rsod.solutions", aliases)).toBe("anton1rsod");
  });

  it("matches case-insensitively on input email", () => {
    expect(resolveHandle("Anton@RSOD.Solutions", aliases)).toBe("anton1rsod");
  });

  it("strips <id>+ prefix from GitHub noreply emails when no alias matches", () => {
    expect(
      resolveHandle("12345+octocat@users.noreply.github.com", new Map()),
    ).toBe("octocat");
  });

  it("handles bare noreply emails with no <id>+ prefix", () => {
    expect(resolveHandle("octocat@users.noreply.github.com", new Map())).toBe(
      "octocat",
    );
  });

  it("falls back to local-part for unaliased non-noreply emails (lowercased)", () => {
    expect(resolveHandle("AlIcE@example.com", new Map())).toBe("alice");
  });
});

describe("readAliases", () => {
  it("returns an empty map when the file does not exist (ENOENT)", async () => {
    const aliases = await readAliases(
      path.join(__dirname, "../fixtures/__does_not_exist__.md"),
    );
    expect(aliases.size).toBe(0);
  });
});
