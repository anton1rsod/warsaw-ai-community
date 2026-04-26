import { describe, it, expect } from "vitest";
import { validateAndPruneCitations, buildGitHubBlobLink } from "@/retrieval/cite";

describe("validateAndPruneCitations", () => {
  it("leaves valid citations unchanged", () => {
    const r = validateAndPruneCitations('foo <citation id="1"/> bar', 1);
    expect(r).toBe('foo <citation id="1"/> bar');
  });

  it('replaces an out-of-range citation with "(citation pruned)"', () => {
    const r = validateAndPruneCitations('foo <citation id="3"/> bar', 1);
    expect(r).toBe("foo (citation pruned) bar");
  });

  it("handles multiple citations with mixed validity", () => {
    const r = validateAndPruneCitations('a <citation id="1"/> b <citation id="9"/> c', 2);
    expect(r).toBe('a <citation id="1"/> b (citation pruned) c');
  });

  it("accepts <CITATION> uppercase variants", () => {
    const r = validateAndPruneCitations('a <CITATION id="1"/> b', 1);
    expect(r).toBe('a <CITATION id="1"/> b');
  });

  it("accepts space before /> ('<citation id=\"1\" />')", () => {
    const r = validateAndPruneCitations('a <citation id="1" /> b', 1);
    expect(r).toBe('a <citation id="1" /> b');
  });

  it("leaves malformed (unquoted) tags as literal text", () => {
    const r = validateAndPruneCitations("a <citation id=1/> b", 5);
    expect(r).toBe("a <citation id=1/> b");
  });

  it("treats id 0 as invalid", () => {
    const r = validateAndPruneCitations('a <citation id="0"/> b', 5);
    expect(r).toBe("a (citation pruned) b");
  });
});

describe("buildGitHubBlobLink", () => {
  it("builds a GitHub blob URL with line range fragment", () => {
    const url = buildGitHubBlobLink({
      owner: "warsaw-ai", repo: "community", branch: "main",
      sourcePath: "community/archive/2026-04/foo.md", lineRange: [12, 28]
    });
    expect(url).toBe("https://github.com/warsaw-ai/community/blob/main/community/archive/2026-04/foo.md#L12-L28");
  });

  it("collapses single-line ranges", () => {
    const url = buildGitHubBlobLink({
      owner: "x", repo: "y", branch: "main",
      sourcePath: "a.md", lineRange: [5, 5]
    });
    expect(url).toBe("https://github.com/x/y/blob/main/a.md#L5");
  });
});
