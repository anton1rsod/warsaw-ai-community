import { describe, it, expect } from "vitest";
import { SavePersonaSchema, validatePersonaFrontmatter } from "@/lib/persona-editor";

describe("SavePersonaSchema", () => {
  it("accepts content up to 64KB", () => {
    expect(SavePersonaSchema.safeParse({ content: "a".repeat(65_536) }).success).toBe(true);
  });
  it("rejects content over 64KB (H141)", () => {
    expect(SavePersonaSchema.safeParse({ content: "a".repeat(65_537) }).success).toBe(false);
  });

  // H152 parity: the cap is UTF-8 BYTES, not UTF-16 code units.
  it("rejects 21,846 three-byte CJK chars = 65,538 bytes (old .max() admitted ~3× bytes)", () => {
    const cjk = "字".repeat(21_846); // U+5B57 → 3 UTF-8 bytes each
    expect(cjk.length).toBe(21_846); // would PASS the old UTF-16 code-unit cap
    expect(new TextEncoder().encode(cjk).length).toBe(65_538);
    expect(SavePersonaSchema.safeParse({ content: cjk }).success).toBe(false);
  });
  it("accepts 21,845 three-byte CJK chars = 65,535 bytes", () => {
    expect(SavePersonaSchema.safeParse({ content: "字".repeat(21_845) }).success).toBe(true);
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
  it("rejects when schema_version missing", () => {
    const bad = "---\npersona_id: jane-d\ndisplay_name: Jane D.\n---\n# Jane\n";
    expect(validatePersonaFrontmatter(bad, "jane-d")).toEqual({ ok: false, error: "frontmatter_missing" });
  });
  it("rejects malformed YAML frontmatter (gray-matter throws) as frontmatter_missing", () => {
    // Unclosed flow sequence → js-yaml YAMLException → the matter() try/catch.
    const malformed = "---\nfoo: [unclosed\n---\n# X\n";
    expect(validatePersonaFrontmatter(malformed, "jane-d")).toEqual({ ok: false, error: "frontmatter_missing" });
  });
});
