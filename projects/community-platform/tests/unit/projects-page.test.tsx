import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * v0.8.1 (chat-44 followup) — Projects page hover contrast fix.
 *
 * The v0.1 scaffolding had `dark:hover:bg-neutral-900` + `dark:text-neutral-400`
 * Tailwind variants on the project cards. Because Tailwind defaults to
 * `darkMode: "media"` and `globals.css` has no `@media (prefers-color-scheme:
 * dark)` rules to invert the cream/ink tokens, the `dark:` hover fired on a
 * macOS-dark-mode viewer but the title text didn't get a counterpart
 * `dark:text-cream` — the card flipped to near-black with invisible text.
 *
 * Lock the cream-aesthetic contract: zero `dark:` variants on this page,
 * hover uses `bg-cream-deep`, slug uses the platform's font-voice + text-dust
 * tokens (matching the v0.8 §5.2 accent treatment elsewhere).
 */

describe("Projects page v0.8.1 — cream-aesthetic, no dark: variants", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/projects/page.tsx"),
    "utf8",
  );

  it("does not use Tailwind `dark:` variants (cream/ink aesthetic only)", () => {
    expect(src).not.toMatch(/\bdark:/);
  });

  it("uses cream-aesthetic hover token (bg-cream-deep)", () => {
    expect(src).toMatch(/hover:bg-cream-deep/);
  });

  it("uses font-voice + text-dust on the slug line (v0.8 §5.2 voice contract)", () => {
    expect(src).toMatch(/font-voice/);
    expect(src).toMatch(/text-dust/);
  });

  it("no longer uses the neutral-* color scale", () => {
    expect(src).not.toMatch(/\btext-neutral-/);
    expect(src).not.toMatch(/\bbg-neutral-/);
  });
});
