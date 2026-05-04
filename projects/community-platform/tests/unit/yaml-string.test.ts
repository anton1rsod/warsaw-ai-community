import { describe, it, expect } from "vitest";
import { yamlString } from "@/lib/yaml-string";

describe("H11: yamlString — YAML-safe double-quoted emit", () => {
  it("wraps ASCII in double quotes", () => {
    expect(yamlString("Anton Safronov")).toBe(`"Anton Safronov"`);
  });
  it("escapes embedded double quotes", () => {
    expect(yamlString(`Anton "the founder" Safronov`)).toBe(
      `"Anton \\"the founder\\" Safronov"`,
    );
  });
  it("escapes backslashes", () => {
    expect(yamlString(`a\\b`)).toBe(`"a\\\\b"`);
  });
  it("escapes newlines as \\n (preventing YAML block scalars)", () => {
    expect(yamlString("line1\nline2")).toBe(`"line1\\nline2"`);
  });
  it("preserves Unicode (Polish characters)", () => {
    expect(yamlString("Łukasz Świątek")).toBe(`"Łukasz Świątek"`);
  });
  it("handles empty string", () => {
    expect(yamlString("")).toBe(`""`);
  });
  it("handles strings YAML 1.1 would auto-type as timestamps", () => {
    expect(yamlString("2026-04-24")).toBe(`"2026-04-24"`);
  });
  it("handles strings YAML 1.1 would auto-type as booleans", () => {
    expect(yamlString("yes")).toBe(`"yes"`);
  });
});
