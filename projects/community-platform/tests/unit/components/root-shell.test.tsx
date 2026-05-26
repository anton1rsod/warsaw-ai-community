import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("RootShell v0.8 — footer pin", () => {
  const src = readFileSync(
    resolve(__dirname, "../../../app/components/RootShell.tsx"),
    "utf8",
  );
  it("wraps children in a flex-1 container so the footer pins to the viewport bottom", () => {
    expect(src).toMatch(/<div className="flex-1">\{children\}<\/div>/);
  });
});
