import { statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

// The retired PL-monogram icon-512 was ~9.6KB. The amber-field S 512 export is
// ~15KB. Assert the swapped files exist and match the S export's byte size so a
// regression to the PL monogram is caught.
const pub = (p: string) => resolve(__dirname, "../../public", p);
const sym = (p: string) =>
  resolve(__dirname, "../../../../community/brand/exports/symbol", p);

describe("v0.8: favicon + PWA icons are the amber-field S", () => {
  it("icon-512 matches the S export byte size", () => {
    expect(statSync(pub("icons/icon-512.png")).size).toBe(
      statSync(sym("subploters-symbol-512.png")).size,
    );
  });
  it("favicon.ico matches the S export byte size", () => {
    expect(statSync(pub("favicon.ico")).size).toBe(
      statSync(sym("favicon.ico")).size,
    );
  });
});
