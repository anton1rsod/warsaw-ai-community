import { describe, it, expect } from "vitest";
import { escapeMd, formatLinkMd, formatBoldMd } from "@/telegram/format";

describe("escapeMd", () => {
  it("escapes all MarkdownV2 special chars", () => {
    expect(escapeMd("a_b*c[d]e(f)")).toBe("a\\_b\\*c\\[d\\]e\\(f\\)");
  });
  it("escapes period and hyphen", () => {
    expect(escapeMd("2026-04-26.")).toBe("2026\\-04\\-26\\.");
  });
  it("leaves plain text unchanged", () => {
    expect(escapeMd("hello world")).toBe("hello world");
  });
});

describe("formatLinkMd", () => {
  it("produces a MarkdownV2 link with escaped link text", () => {
    expect(formatLinkMd("foo bar.md", "https://github.com/x/y/blob/main/foo-bar.md#L1-L5"))
      .toBe("[foo bar\\.md](https://github.com/x/y/blob/main/foo-bar.md#L1-L5)");
  });
});

describe("formatBoldMd", () => {
  it("wraps escaped text in *...*", () => {
    expect(formatBoldMd("hello.")).toBe("*hello\\.*");
  });
});
