import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { describe, it, expect } from "vitest";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("H98: zero dark: variants remain in app/", () => {
  const appDir = resolve(__dirname, "../../app");
  const offenders = walk(appDir)
    .filter((f) => /\.(ts|tsx|css)$/.test(f))
    .filter((f) => /\bdark:/.test(readFileSync(f, "utf8")));

  it("no app/ source file uses a dark: variant", () => {
    expect(offenders, `dark: still present in:\n${offenders.join("\n")}`).toEqual([]);
  });
});
