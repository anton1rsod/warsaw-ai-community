import { describe, expect, it } from "vitest";
import {
  SaveProfileSchema,
  parseFrontmatter,
  serializeFrontmatter,
  composeProfile,
  hasRequiredFrontmatter,
  REQUIRED_FRONTMATTER_KEYS,
  parseProfileFrontmatter,
  validateProfileInvariants,
  deriveThankInitialState,
  ProfileFrontmatterSchema,
  ThanksRecordSchema,
  type SaveErrorCode,
} from "@/lib/profile-editor";

describe("SaveProfileSchema", () => {
  describe("H18: profile body size cap 64KB", () => {
    it("accepts body up to 65_536 bytes", () => {
      const body = "x".repeat(65_536);
      const result = SaveProfileSchema.safeParse({ body, expectedSha: "sha" });
      expect(result.success).toBe(true);
    });

    it("rejects body over 65_536 bytes", () => {
      const body = "x".repeat(65_537);
      const result = SaveProfileSchema.safeParse({ body, expectedSha: "sha" });
      expect(result.success).toBe(false);
    });

    it("rejects non-string body", () => {
      const result = SaveProfileSchema.safeParse({ body: 123, expectedSha: "sha" });
      expect(result.success).toBe(false);
    });

    it("accepts empty body", () => {
      const result = SaveProfileSchema.safeParse({ body: "", expectedSha: "sha" });
      expect(result.success).toBe(true);
    });
  });

  describe("H16: expectedSha is required (optimistic-lock token)", () => {
    it("rejects payload without expectedSha", () => {
      const result = SaveProfileSchema.safeParse({ body: "ok" });
      expect(result.success).toBe(false);
    });

    it("rejects empty expectedSha", () => {
      const result = SaveProfileSchema.safeParse({ body: "ok", expectedSha: "" });
      expect(result.success).toBe(false);
    });

    it("rejects non-string expectedSha (formData.get('sha') is null when missing)", () => {
      const result = SaveProfileSchema.safeParse({ body: "ok", expectedSha: null });
      expect(result.success).toBe(false);
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

describe("v0.3: ProfileFrontmatterSchema (D11, D19, O8)", () => {
  it("parses events_going + events_interested as string arrays", () => {
    const yaml = `---
events_going:
  - 2026-06-15-hack
events_interested:
  - 2026-07-04-other
event_rsvp_visibility: members_only
---
body
`;
    const { fm } = parseProfileFrontmatter(yaml);
    expect(fm.events_going).toEqual(["2026-06-15-hack"]);
    expect(fm.events_interested).toEqual(["2026-07-04-other"]);
    expect(fm.event_rsvp_visibility).toBe("members_only");
  });

  it("defaults all v0.3 fields when missing", () => {
    const { fm } = parseProfileFrontmatter("---\nname: Anton\n---\n");
    expect(fm.events_going).toEqual([]);
    expect(fm.events_interested).toEqual([]);
    expect(fm.event_rsvp_visibility).toBe("members_only");
    expect(fm.thanks_given).toEqual([]);
  });

  it("preserves v0.2 fields (passthrough)", () => {
    const yaml = `---
name: Anton
github_handle: anton1rsod
consented_at: "2026-05-01T00:00:00Z"
---
body
`;
    const { fm } = parseProfileFrontmatter(yaml);
    expect((fm as unknown as { name: string }).name).toBe("Anton");
    expect((fm as unknown as { github_handle: string }).github_handle).toBe("anton1rsod");
  });

  it("parses thanks_given as ThanksRecord array", () => {
    const yaml = `---
thanks_given:
  - recipient: bob
    item_type: status
    item_id: 2026-W19/bob
    given_at: "2026-05-12T10:00:00Z"
---
body
`;
    const { fm } = parseProfileFrontmatter(yaml);
    expect(fm.thanks_given).toHaveLength(1);
    expect(fm.thanks_given[0]).toMatchObject({
      recipient: "bob",
      item_type: "status",
      item_id: "2026-W19/bob",
    });
  });

  it("ThanksRecordSchema rejects invalid item_type", () => {
    expect(() =>
      ThanksRecordSchema.parse({
        recipient: "bob",
        item_type: "invalid",
        item_id: "x",
        given_at: "2026-05-12T10:00:00Z",
      }),
    ).toThrow();
  });

  it("ProfileFrontmatterSchema is exported and callable", () => {
    const result = ProfileFrontmatterSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("H40 / D11: validateProfileInvariants (mutual exclusion)", () => {
  it("rejects slug present in both events_going AND events_interested", () => {
    expect(() =>
      validateProfileInvariants({
        events_going: ["2026-06-15-hack"],
        events_interested: ["2026-06-15-hack"],
      }),
    ).toThrow(/mutual exclusion|both/i);
  });

  it("accepts non-overlapping arrays", () => {
    expect(() =>
      validateProfileInvariants({
        events_going: ["2026-06-15-hack"],
        events_interested: ["2026-07-04-other"],
      }),
    ).not.toThrow();
  });

  it("accepts empty arrays / undefined", () => {
    expect(() => validateProfileInvariants({})).not.toThrow();
    expect(() => validateProfileInvariants({ events_going: [], events_interested: [] })).not.toThrow();
  });
});

describe("H53 / D19: deriveThankInitialState", () => {
  it("returns 'not-signed-in' when viewerSlug is undefined", () => {
    expect(deriveThankInitialState(undefined, "bob", "status", "x", undefined)).toBe("not-signed-in");
  });

  it("returns 'self' when viewerSlug === recipient", () => {
    expect(deriveThankInitialState("alice", "alice", "status", "x", undefined)).toBe("self");
  });

  it("returns 'thanked' when viewer profile contains the exact triple", () => {
    const profile = {
      events_going: [],
      events_interested: [],
      event_rsvp_visibility: "members_only" as const,
      thanks_given: [
        { recipient: "bob", item_type: "status" as const, item_id: "x", given_at: "2026-05-12T10:00:00Z" },
      ],
    };
    expect(deriveThankInitialState("alice", "bob", "status", "x", profile)).toBe("thanked");
  });

  it("returns 'not-thanked' when viewer profile has no matching triple", () => {
    const profile = {
      events_going: [],
      events_interested: [],
      event_rsvp_visibility: "members_only" as const,
      thanks_given: [],
    };
    expect(deriveThankInitialState("alice", "bob", "status", "x", profile)).toBe("not-thanked");
  });

  it("returns 'not-thanked' when viewerProfile is undefined but viewer is signed in", () => {
    expect(deriveThankInitialState("alice", "bob", "status", "x", undefined)).toBe("not-thanked");
  });

  it("triple match requires ALL three fields (recipient, item_type, item_id)", () => {
    const profile = {
      events_going: [],
      events_interested: [],
      event_rsvp_visibility: "members_only" as const,
      thanks_given: [
        { recipient: "bob", item_type: "status" as const, item_id: "x", given_at: "2026-05-12T10:00:00Z" },
      ],
    };
    // Different item_type → not thanked.
    expect(deriveThankInitialState("alice", "bob", "contribution", "x", profile)).toBe("not-thanked");
    // Different item_id → not thanked.
    expect(deriveThankInitialState("alice", "bob", "status", "y", profile)).toBe("not-thanked");
  });
});
