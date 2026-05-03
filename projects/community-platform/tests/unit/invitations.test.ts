import { describe, it, expect } from "vitest";
import { canonicalJson } from "@/lib/invitations";

describe("canonicalJson", () => {
  it("emits compact JSON with no whitespace", () => {
    expect(canonicalJson({ a: 1, b: 2 })).toBe(`{"a":1,"b":2}`);
  });
  it("sorts object keys alphabetically (sign + verify must agree)", () => {
    expect(canonicalJson({ b: 2, a: 1 })).toBe(`{"a":1,"b":2}`);
  });
  it("omits undefined values (so optional payload fields don't differ)", () => {
    expect(canonicalJson({ a: 1, b: undefined, c: 3 })).toBe(`{"a":1,"c":3}`);
  });
  it("preserves explicit null", () => {
    expect(canonicalJson({ a: null })).toBe(`{"a":null}`);
  });
  it("handles nested objects deterministically", () => {
    expect(canonicalJson({ outer: { z: 1, a: 2 } })).toBe(
      `{"outer":{"a":2,"z":1}}`,
    );
  });
  it("escapes strings via JSON.stringify rules", () => {
    expect(canonicalJson({ s: 'he said "hi"' })).toBe(`{"s":"he said \\"hi\\""}`);
  });
});
