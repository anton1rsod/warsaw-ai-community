import { describe, expect, it } from "vitest";
import { ProfileFrontmatterSchema } from "@/lib/profile-editor";

describe("ProfileFrontmatterSchema — persona_source_url (v0.12 O4)", () => {
  it("accepts and preserves a string persona_source_url", () => {
    const parsed = ProfileFrontmatterSchema.parse({
      persona_source_url: "https://raw.githubusercontent.com/u/r/main/p.public.md",
    });
    expect(parsed.persona_source_url).toBe(
      "https://raw.githubusercontent.com/u/r/main/p.public.md",
    );
  });

  it("stays optional — absent key parses to undefined (no default)", () => {
    expect(ProfileFrontmatterSchema.parse({}).persona_source_url).toBeUndefined();
  });

  it("is NOT URL-validated by the schema (H151's validatePersonaUrl is the authoritative guard at use time — H153)", () => {
    // Deliberate: a stale/garbage stored value must not brick profile parsing.
    expect(
      ProfileFrontmatterSchema.safeParse({ persona_source_url: "not a url" }).success,
    ).toBe(true);
  });

  it("rejects non-string values", () => {
    expect(ProfileFrontmatterSchema.safeParse({ persona_source_url: 42 }).success).toBe(false);
  });
});
