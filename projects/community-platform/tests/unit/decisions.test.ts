import { describe, expect, it } from "vitest";
import path from "node:path";
import { listDecisions, readDecision } from "@/lib/decisions";

const REPO_ROOT = path.resolve(__dirname, "../fixtures/repo");

describe("decisions", () => {
  it("lists decisions matching NNNN-*.md", async () => {
    const decisions = await listDecisions(REPO_ROOT);
    expect(decisions[0]?.number).toBe(1);
    expect(decisions[0]?.slug).toBe("0001-example");
    expect(decisions[0]?.title).toBe("ADR-0001: Example decision");
    expect(decisions[0]?.status).toBe("Accepted");
    expect(decisions[0]?.date).toBe("2026-04-24");
  });

  it("reads a decision body", async () => {
    const d = await readDecision(REPO_ROOT, "0001-example");
    expect(d?.body).toContain("Use the fixture.");
  });

  it("returns null for unknown slug", async () => {
    expect(await readDecision(REPO_ROOT, "9999-no")).toBeNull();
  });

  it("rejects path traversal", async () => {
    expect(await readDecision(REPO_ROOT, "../etc")).toBeNull();
  });
});
