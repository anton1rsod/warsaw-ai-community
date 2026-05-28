import { describe, expect, it } from "vitest";
import { StarterPackSchema, type StarterPackItem } from "@/lib/starter-pack";

describe("StarterPackSchema (H114)", () => {
  it("accepts a valid items list of mixed artifact types", () => {
    const valid = {
      items: [
        { type: "decision", slug: "0016-telegram-echo-statuses" },
        { type: "project", slug: "gbrain" },
        { type: "event", slug: "2026-05-21-meetup-4" },
        { type: "status", slug: "2026-W22/anton1rsod" },
        { type: "member", slug: "anton-safronov" },
      ],
    };
    const result = StarterPackSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(5);
      const types = result.data.items.map((i: StarterPackItem) => i.type);
      expect(types).toEqual(["decision", "project", "event", "status", "member"]);
    }
  });

  it("rejects an unknown artifact type", () => {
    const invalid = {
      items: [{ type: "garbage", slug: "x" }],
    };
    const result = StarterPackSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a missing slug", () => {
    const invalid = {
      items: [{ type: "decision" }],
    };
    const result = StarterPackSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 1 item", () => {
    const result = StarterPackSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 8 items (caps the curated set)", () => {
    const items = Array.from({ length: 9 }, () => ({
      type: "decision" as const,
      slug: "0001-oss-first-licensing",
    }));
    const result = StarterPackSchema.safeParse({ items });
    expect(result.success).toBe(false);
  });
});
