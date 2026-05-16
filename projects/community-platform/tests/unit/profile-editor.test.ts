import { describe, expect, it } from "vitest";
import {
  SaveProfileSchema,
  parseFrontmatter,
  serializeFrontmatter,
  composeProfile,
  hasRequiredFrontmatter,
  REQUIRED_FRONTMATTER_KEYS,
  type SaveErrorCode,
} from "@/lib/profile-editor";

describe("SaveProfileSchema", () => {
  describe("H18: profile body size cap 64KB", () => {
    it("accepts body up to 65_536 bytes", () => {
      const body = "x".repeat(65_536);
      const result = SaveProfileSchema.safeParse({ body });
      expect(result.success).toBe(true);
    });

    it("rejects body over 65_536 bytes", () => {
      const body = "x".repeat(65_537);
      const result = SaveProfileSchema.safeParse({ body });
      expect(result.success).toBe(false);
    });

    it("rejects non-string body", () => {
      const result = SaveProfileSchema.safeParse({ body: 123 });
      expect(result.success).toBe(false);
    });

    it("accepts empty body", () => {
      const result = SaveProfileSchema.safeParse({ body: "" });
      expect(result.success).toBe(true);
    });
  });
});

describe("parseFrontmatter", () => {
  it("parses frontmatter + body from a v0.1 consent stub", () => {
    const content = `---
name: Anton Safronov
github_handle: anton1rsod
consented_at: 2026-05-03T13:59:19.410Z
---

_Profile prose to come — open a PR to fill this in._
`;
    const result = parseFrontmatter(content);
    expect(result.data.name).toBe("Anton Safronov");
    expect(result.data.github_handle).toBe("anton1rsod");
    expect(result.data.consented_at).toBe("2026-05-03T13:59:19.410Z");
    expect(result.body.trim()).toBe(
      "_Profile prose to come — open a PR to fill this in._",
    );
  });

  it("returns empty data and full content as body when no frontmatter", () => {
    const result = parseFrontmatter("Just a body, no frontmatter.\n");
    expect(result.data).toEqual({});
    expect(result.body).toContain("Just a body");
  });
});

describe("serializeFrontmatter", () => {
  it("round-trips parse → serialize for a v0.1 consent stub", () => {
    const original = `---
name: Anton Safronov
github_handle: anton1rsod
consented_at: 2026-05-03T13:59:19.410Z
---

_Profile prose to come._
`;
    const parsed = parseFrontmatter(original);
    const re = serializeFrontmatter(parsed.data, parsed.body);
    const reparsed = parseFrontmatter(re);
    expect(reparsed.data).toEqual(parsed.data);
    expect(reparsed.body.trim()).toBe(parsed.body.trim());
  });
});

describe("composeProfile", () => {
  describe("H19: frontmatter integrity across edits", () => {
    it("preserves all required keys verbatim when only body changes", () => {
      const data = {
        name: "Anton Safronov",
        github_handle: "anton1rsod",
        consented_at: "2026-05-03T13:59:19.410Z",
      };
      const result = composeProfile(data, "My new prose.");
      const parsed = parseFrontmatter(result);
      expect(parsed.data.name).toBe("Anton Safronov");
      expect(parsed.data.github_handle).toBe("anton1rsod");
      expect(parsed.data.consented_at).toBe("2026-05-03T13:59:19.410Z");
      expect(parsed.body.trim()).toBe("My new prose.");
    });

    it("preserves non-required frontmatter keys", () => {
      const data = {
        name: "Anton Safronov",
        github_handle: "anton1rsod",
        consented_at: "2026-05-03T13:59:19.410Z",
        custom_field: "preserved",
      };
      const result = composeProfile(data, "New body.");
      const parsed = parseFrontmatter(result);
      expect(parsed.data.custom_field).toBe("preserved");
    });

    it("REQUIRED_FRONTMATTER_KEYS contains name, github_handle, consented_at", () => {
      expect(REQUIRED_FRONTMATTER_KEYS).toEqual([
        "name",
        "github_handle",
        "consented_at",
      ]);
    });
  });
});

describe("SaveErrorCode type", () => {
  it("includes the documented error codes", () => {
    const codes: SaveErrorCode[] = [
      "not_authenticated",
      "not_a_member",
      "invalid_body",
      "file_missing",
      "frontmatter_corrupt",
      "sha_conflict",
      "refresh_needed",
      "unknown",
    ];
    expect(codes.length).toBe(8);
  });
});

describe("hasRequiredFrontmatter", () => {
  it("returns true when all required keys present and non-empty", () => {
    expect(
      hasRequiredFrontmatter({
        name: "Anton",
        github_handle: "anton1rsod",
        consented_at: "2026-01-01T00:00:00.000Z",
      }),
    ).toBe(true);
  });

  it("returns false when a required key is missing", () => {
    expect(
      hasRequiredFrontmatter({ name: "Anton", github_handle: "anton1rsod" }),
    ).toBe(false);
  });

  it("returns false when a required key is empty string", () => {
    expect(
      hasRequiredFrontmatter({
        name: "",
        github_handle: "anton1rsod",
        consented_at: "2026-01-01T00:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("returns false when a required key is non-string", () => {
    expect(
      hasRequiredFrontmatter({
        name: 123,
        github_handle: "anton1rsod",
        consented_at: "2026-01-01T00:00:00.000Z",
      }),
    ).toBe(false);
  });
});
