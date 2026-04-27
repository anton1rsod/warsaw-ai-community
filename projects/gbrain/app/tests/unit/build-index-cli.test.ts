import { describe, it, expect } from "vitest";
import path from "node:path";
import { existsSync } from "node:fs";
import { resolveCliRepoRoot } from "../../scripts/build-index";

describe("scripts/build-index.ts resolveCliRepoRoot()", () => {
  it("resolves repo root from arbitrary script URL with correct ..-count", () => {
    const fakeUrl = "file:///workspace/projects/gbrain/app/scripts/build-index.ts";
    expect(resolveCliRepoRoot(fakeUrl)).toBe("/workspace");
  });

  it("resolves to the actual repo root from the real script URL", () => {
    const actualUrl = new URL("../../scripts/build-index.ts", import.meta.url).href;
    const root = resolveCliRepoRoot(actualUrl);
    expect(existsSync(path.join(root, "community", "archive"))).toBe(true);
  });
});
