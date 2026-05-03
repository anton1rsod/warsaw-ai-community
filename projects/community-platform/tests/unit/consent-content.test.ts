import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateConsentMarkdown } from "@/lib/consent-content";

describe("generateConsentMarkdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-15T14:23:11.456Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("emits canonical YAML frontmatter for ASCII name", () => {
    const md = generateConsentMarkdown({
      name: "Anton Safronov",
      githubHandle: "anton1rsod",
    });
    expect(md).toMatchSnapshot();
  });

  it("quotes Unicode names safely (Polish diacritics)", () => {
    const md = generateConsentMarkdown({
      name: "Łukasz Świątek",
      githubHandle: "lukaszsw",
    });
    expect(md).toMatchSnapshot();
  });

  it("escapes embedded double quotes (H11)", () => {
    const md = generateConsentMarkdown({
      name: `Anton "the founder" Safronov`,
      githubHandle: "anton1rsod",
    });
    expect(md).toMatchSnapshot();
  });

  it("rejects YAML-implicit-timestamp names by quoting (H11)", () => {
    const md = generateConsentMarkdown({
      name: "2026-04-24",
      githubHandle: "anton1rsod",
    });
    expect(md).toContain(`name: "2026-04-24"`);
    expect(md).toMatchSnapshot();
  });

  it("renders consented_at as quoted ISO timestamp", () => {
    const md = generateConsentMarkdown({
      name: "Test User",
      githubHandle: "test",
    });
    expect(md).toContain(`consented_at: "2026-05-15T14:23:11.456Z"`);
  });
});
