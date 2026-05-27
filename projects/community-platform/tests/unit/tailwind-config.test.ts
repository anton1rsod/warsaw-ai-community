import { describe, it, expect } from "vitest";
import config from "../../tailwind.config";

describe("H97: dark mode neutralized via selector strategy", () => {
  it("sets darkMode to 'selector' (not 'media' — dead-codes all dark: variants since no .dark ancestor is rendered)", () => {
    expect(config.darkMode).toBe("selector");
  });
});

describe("v0.6 tailwind.config — theme extensions", () => {
  it("extends colors with v0.6 tokens mapped to CSS vars", () => {
    const colors = config.theme?.extend?.colors as Record<string, string | Record<string, string>>;
    expect(colors).toBeDefined();
    expect(colors.cream).toBe("var(--color-cream)");
    expect(colors["cream-deep"]).toBe("var(--color-cream-deep)");
    expect(colors.ink).toBe("var(--color-ink)");
    expect(colors.dust).toBe("var(--color-dust)");
    expect(colors.paper).toBe("var(--color-paper)");
    expect(colors.alert).toBe("var(--color-alert)");
  });

  it("preserves v0.4 accent ramp", () => {
    const colors = config.theme?.extend?.colors as Record<string, Record<string, string>>;
    expect(colors.accent?.["500"]).toBe("var(--color-accent-500)");
  });

  it("extends fontFamily with display/body/voice → CSS variables", () => {
    const ff = config.theme?.extend?.fontFamily as Record<string, string[]>;
    // v0.8 §4.2: display → Geist (brand.md §2 typography realignment)
    expect(ff.display).toEqual(["var(--font-geist)", "system-ui", "sans-serif"]);
    expect(ff.body).toEqual(["var(--font-inter)", "system-ui", "sans-serif"]);
    expect(ff.voice).toEqual(["var(--font-jetbrains)", "ui-monospace", "monospace"]);
    // v0.7 geist token retired in v0.8 §4.2 (#41 reconciliation)
    expect(ff.geist).toBeUndefined();
  });
});
