import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("v0.9.1 H106: ConsentModal native <dialog> (C8)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/components/ConsentModal.tsx"),
    "utf8",
  );

  it("uses a native <dialog> + showModal, not a role=dialog div", () => {
    expect(src).toMatch(/<dialog/);
    expect(src).toMatch(/showModal\(\)/);
    expect(src).not.toMatch(/role="dialog"/);
  });

  it("uses warm tokens + Pill, no neutral-*/rounded", () => {
    expect(src).toMatch(/backdrop:bg-ink\/50/);
    expect(src).toMatch(/bg-cream/);
    expect(src).toMatch(/from "@\/app\/components\/Pill"/);
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\brounded\b/);
  });

  it("keeps an explicit aria-labelledby", () => {
    expect(src).toMatch(/aria-labelledby="consent-modal-title"/);
  });
});
