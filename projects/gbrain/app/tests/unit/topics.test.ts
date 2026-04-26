import { describe, it, expect } from "vitest";
import { buildTopicMap } from "../../src/topics";
import type { Config } from "../../src/config";

function makeCfg(overrides: Partial<Config["topics"]> = {}): Config {
  return {
    telegram: { token: "t", webhookSecret: "w", chatId: -1 },
    ai: { gatewayKey: undefined, geminiKey: "k" },
    github: { token: "g", owner: "o", repo: "r", branch: "main" },
    topics: {
      generalId: undefined,
      qaId: undefined,
      guidesId: undefined,
      meetupsId: undefined,
      projectsId: undefined,
      newsSignalsId: 42,
      toolsId: undefined,
      pitchesId: undefined,
      ...overrides
    },
    digest: { timezone: "Europe/Warsaw", hourLocal: 9 },
    flags: { killSwitch: false, digestEnabled: true },
    cron: { secret: "c" },
    archive: { namespace: "" },
    links: { pinnedMsgUrlByTopic: {}, charterUrl: "" }
  };
}

describe("buildTopicMap()", () => {
  it("includes only topics with numeric ids", () => {
    const map = buildTopicMap(makeCfg());
    expect(map.size).toBe(1);
    expect(map.get(42)).toEqual({ id: 42, name: "News & Signals", class: "formal" });
  });

  it("labels News & Signals as formal and General as casual", () => {
    const map = buildTopicMap(makeCfg({ generalId: 7 }));
    expect(map.get(7)?.class).toBe("casual");
    expect(map.get(42)?.class).toBe("formal");
  });

  it("maps all eight topics when all ids supplied", () => {
    const map = buildTopicMap(
      makeCfg({
        generalId: 1,
        qaId: 2,
        guidesId: 3,
        meetupsId: 4,
        projectsId: 5,
        newsSignalsId: 6,
        toolsId: 7,
        pitchesId: 8
      })
    );
    expect(map.size).toBe(8);
    expect(map.get(3)?.name).toBe("Guides");
    expect(map.get(8)?.name).toBe("Builds & Pitches");
  });
});
