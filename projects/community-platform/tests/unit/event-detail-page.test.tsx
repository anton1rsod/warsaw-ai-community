import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("/events/[slug] v0.9 — no dark: variants", () => {
  const src = readFileSync(resolve(__dirname, "../../app/events/[slug]/page.tsx"), "utf8");
  it("uses no Tailwind `dark:` variants", () => {
    expect(src).not.toMatch(/\bdark:/);
  });
});
