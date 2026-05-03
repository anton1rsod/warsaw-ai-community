import { describe, it, expect } from "vitest";
import { slugify, RESERVED_SLUGS, nextAvailableSlug } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases ASCII names", () => {
    expect(slugify("Anton Safronov")).toBe("anton-safronov");
  });
  it("strips combining diacritics (NFKD)", () => {
    // NFKD decomposes diacritics-as-combining-marks (Ś→S+◌́, ą→a+◌̨), but
    // standalone Polish letters like Ł (U+0141) have no canonical
    // decomposition and are dropped by the [a-z0-9] filter. Behavior
    // matches v0.1's lib/roster.ts helper that this module promotes.
    expect(slugify("Łukasz Świątek")).toBe("ukasz-swiatek");
  });
  it("collapses runs of non-alphanumeric to a single hyphen", () => {
    expect(slugify("Foo  Bar!! Baz")).toBe("foo-bar-baz");
  });
  it("strips leading/trailing hyphens", () => {
    expect(slugify("--Foo--")).toBe("foo");
  });
});

describe("RESERVED_SLUGS", () => {
  it("includes roster, git-email-aliases, invitations", () => {
    expect(RESERVED_SLUGS.has("roster")).toBe(true);
    expect(RESERVED_SLUGS.has("git-email-aliases")).toBe(true);
    expect(RESERVED_SLUGS.has("invitations")).toBe(true);
  });
});

describe("H12: nextAvailableSlug — collision + reserved + cap-at-9", () => {
  it("returns input slug when not reserved and not taken", async () => {
    const exists = async (_: string) => false;
    expect(await nextAvailableSlug("anton-safronov", exists)).toBe(
      "anton-safronov",
    );
  });
  it("starts at -2 when slug is reserved", async () => {
    const exists = async (_: string) => false;
    expect(await nextAvailableSlug("invitations", exists)).toBe(
      "invitations-2",
    );
  });
  it("increments suffix until an unused slug found", async () => {
    const taken = new Set(["foo", "foo-2", "foo-3"]);
    const exists = async (s: string) => taken.has(s);
    expect(await nextAvailableSlug("foo", exists)).toBe("foo-4");
  });
  it("hard caps at -9; throws if exhausted", async () => {
    const taken = new Set(
      ["foo", "foo-2", "foo-3", "foo-4", "foo-5", "foo-6", "foo-7", "foo-8", "foo-9"],
    );
    const exists = async (s: string) => taken.has(s);
    await expect(nextAvailableSlug("foo", exists)).rejects.toThrow(
      /slug collision cap/i,
    );
  });
});
