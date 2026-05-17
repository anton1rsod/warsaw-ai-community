import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("H50: tsconfig types scope", () => {
  it("tsconfig.json has compilerOptions.types: ['node']", () => {
    const tsconfigPath = path.join(__dirname, "..", "..", "tsconfig.json");
    const raw = readFileSync(tsconfigPath, "utf-8");
    // Strip only line comments (// …) — not block comments (/* … */) to avoid
    // false-positives inside JSON string values like "@/*" path aliases.
    const stripped = raw.replace(/^\s*\/\/[^\n]*/gm, "");
    const config = JSON.parse(stripped);
    expect(config.compilerOptions.types).toEqual(["node"]);
  });

  it("GOTCHAS.md row 9 (transitive @types/* failure pattern) is documented", () => {
    const gotchasPath = path.join(__dirname, "..", "..", "GOTCHAS.md");
    const content = readFileSync(gotchasPath, "utf-8");
    expect(content).toMatch(/## 9\. Transitive `@types\/\*` packages/);
  });
});
