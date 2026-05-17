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

describe("H55: PWA manifest validity (D20)", () => {
  it("public/manifest.json parses and has required W3C fields", () => {
    const manifestPath = path.join(__dirname, "..", "..", "public", "manifest.json");
    const raw = readFileSync(manifestPath, "utf-8");
    const m = JSON.parse(raw) as {
      name?: unknown;
      short_name?: unknown;
      start_url?: unknown;
      display?: unknown;
      icons?: unknown;
    };
    expect(typeof m.name).toBe("string");
    expect(typeof m.short_name).toBe("string");
    expect(typeof m.start_url).toBe("string");
    expect(m.display).toBe("standalone");
    expect(Array.isArray(m.icons)).toBe(true);
    const sizes = (m.icons as { sizes: string }[]).map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("icon files exist at the manifest-referenced paths", () => {
    const dir = path.join(__dirname, "..", "..", "public", "icons");
    // readFileSync throws if missing — wrap in expect.
    expect(() => readFileSync(path.join(dir, "icon-192.png"))).not.toThrow();
    expect(() => readFileSync(path.join(dir, "icon-512.png"))).not.toThrow();
  });
});
