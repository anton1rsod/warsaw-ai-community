import { describe, it, expect } from "vitest";
import { COMMAND_REGISTRY, type CommandName } from "@/help/registry";

describe("COMMAND_REGISTRY", () => {
  it("contains the new commands and the existing /gbrain-* commands", () => {
    const names = Object.keys(COMMAND_REGISTRY);
    expect(names).toContain("ask");
    expect(names).toContain("search");
    expect(names).toContain("help");
    expect(names).toContain("gbrain-forget");
    expect(names).toContain("gbrain-optout");
    expect(names).toContain("gbrain-status");
  });

  it("each entry has non-empty description and detail", () => {
    for (const [name, spec] of Object.entries(COMMAND_REGISTRY)) {
      expect(spec.description.length, `${name} description`).toBeGreaterThan(0);
      expect(spec.detail.length, `${name} detail`).toBeGreaterThan(0);
    }
  });

  it("CommandName is a literal-narrowed union", () => {
    const n: CommandName = "ask";
    expect(n).toBe("ask");
  });
});
