import { describe, expect, it } from "vitest";
import { classifyData } from "@/lib/classification";

describe("classifyData", () => {
  it("returns git for durable artifacts", () => {
    expect(classifyData("roster")).toBe("git");
    expect(classifyData("adr")).toBe("git");
    expect(classifyData("meeting_note")).toBe("git");
    expect(classifyData("project_spec")).toBe("git");
    expect(classifyData("persona")).toBe("git");
    expect(classifyData("profile_prose")).toBe("git");
    expect(classifyData("status_update")).toBe("git");
  });

  it("returns db_or_kv for ephemeral / high-frequency", () => {
    expect(classifyData("session_token")).toBe("db_or_kv");
    expect(classifyData("draft")).toBe("db_or_kv");
    expect(classifyData("rate_limit_counter")).toBe("db_or_kv");
    expect(classifyData("ephemeral_notification")).toBe("db_or_kv");
    expect(classifyData("search_index")).toBe("db_or_kv");
    expect(classifyData("high_frequency_reaction")).toBe("db_or_kv");
  });

  it("throws for unknown kinds (forces ADR per spec §6.1)", () => {
    // @ts-expect-error testing runtime
    expect(() => classifyData("kudo")).toThrow(/unknown/i);
  });
});
