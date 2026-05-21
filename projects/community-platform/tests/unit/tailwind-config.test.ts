import { describe, it, expect } from "vitest";
import config from "../../tailwind.config";

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
    expect(ff.display).toEqual(["var(--font-fraunces)", "Georgia", "serif"]);
    expect(ff.body).toEqual(["var(--font-inter)", "system-ui", "sans-serif"]);
    expect(ff.voice).toEqual(["var(--font-jetbrains)", "ui-monospace", "monospace"]);
  });
});
