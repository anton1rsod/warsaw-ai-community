import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isProductionRuntime } from "@/lib/runtime-env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isProductionRuntime", () => {
  it('returns true when NODE_ENV === "production"', () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isProductionRuntime()).toBe(true);
  });

  it("returns false in dev", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isProductionRuntime()).toBe(false);
  });

  it("returns false in test", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(isProductionRuntime()).toBe(false);
  });

  it("returns false when NODE_ENV is empty/undefined", () => {
    vi.stubEnv("NODE_ENV", "");
    expect(isProductionRuntime()).toBe(false);
  });
});

describe("isProductionRuntime — no local copies in app/", () => {
  // Hermetic guard: if a future PR adds a 5th local copy by accident,
  // this test fails fast so the next chat sees the DRY drift.
  it("only the lib/runtime-env.ts module defines the function", () => {
    const root = resolve(__dirname, "../../");
    const FN_DEF = /function\s+isProductionRuntime\s*\(/;
    const seen: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        if (
          entry === "node_modules" ||
          entry === ".next" ||
          entry === "playwright-report" ||
          entry === "coverage" ||
          entry === "tests" ||
          entry === ".playwright-mcp" ||
          entry === "__generated__"
        )
          continue;
        const p = join(dir, entry);
        if (statSync(p).isDirectory()) {
          walk(p);
          continue;
        }
        if (!/\.tsx?$/.test(entry)) continue;
        const src = readFileSync(p, "utf8");
        if (FN_DEF.test(src)) seen.push(p.slice(root.length + 1));
      }
    };
    walk(resolve(root, "app"));
    walk(resolve(root, "lib"));
    expect(seen).toEqual(["lib/runtime-env.ts"]);
  });
});
