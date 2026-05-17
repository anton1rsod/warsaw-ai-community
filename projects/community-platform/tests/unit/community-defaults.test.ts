import { describe, expect, it } from "vitest";
import { getDefaults } from "../../lib/community-defaults";

describe("community-defaults", () => {
  it("reads timezone + meeting/event defaults from JSON", () => {
    const defaults = getDefaults();
    expect(defaults.timezone).toBe("Europe/Warsaw");
    expect(defaults.meetings.defaultStartTime).toMatch(/^\d{2}:\d{2}$/);
    expect(defaults.meetings.defaultDurationMinutes).toBeGreaterThan(0);
    expect(defaults.events.defaultStartTime).toMatch(/^\d{2}:\d{2}$/);
    expect(defaults.events.defaultDurationMinutes).toBeGreaterThan(0);
  });

  it("Zod schema rejects malformed JSON (start_time must be HH:MM)", async () => {
    const { CommunityDefaultsSchema } = await import("../../lib/community-defaults");
    const malformed = {
      timezone: "Europe/Warsaw",
      meetings: { defaultStartTime: "18:00:00", defaultDurationMinutes: 60, defaultLocation: "" },
      events: { defaultStartTime: "18:00", defaultDurationMinutes: 120, defaultLocation: "" },
    };
    const parsed = CommunityDefaultsSchema.safeParse(malformed);
    expect(parsed.success).toBe(false);
  });
});
