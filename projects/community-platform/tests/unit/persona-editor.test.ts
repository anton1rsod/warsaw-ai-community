import { describe, it, expect } from "vitest";
import { SavePersonaSchema, validatePersonaFrontmatter } from "@/lib/persona-editor";

describe("SavePersonaSchema", () => {
  it("accepts content up to 64KB", () => {
    expect(SavePersonaSchema.safeParse({ content: "a".repeat(65_536) }).success).toBe(true);
  });
  it("rejects content over 64KB (H141)", () => {
    expect(SavePersonaSchema.safeParse({ content: "a".repeat(65_537) }).success).toBe(false);
  });
});

describe("validatePersonaFrontmatter (H142)", () => {
  const ok = "---\npersona_id: jane-d\ndisplay_name: Jane D.\nschema_version: 1.0\n---\n# Jane\n";
  it("accepts when persona_id === slug + required keys present", () => {
    expect(validatePersonaFrontmatter(ok, "jane-d")).toEqual({ ok: true });
  });
  it("rejects when persona_id !== slug", () => {
    expect(validatePersonaFrontmatter(ok, "someone-else")).toEqual({ ok: false, error: "id_mismatch" });
  });
  it("rejects when display_name missing", () => {
    const bad = "---\npersona_id: jane-d\nschema_version: 1.0\n---\n# Jane\n";
    expect(validatePersonaFrontmatter(bad, "jane-d")).toEqual({ ok: false, error: "frontmatter_missing" });
  });
  it("rejects when frontmatter absent entirely", () => {
    expect(validatePersonaFrontmatter("# Jane\n", "jane-d")).toEqual({ ok: false, error: "frontmatter_missing" });
  });
});
