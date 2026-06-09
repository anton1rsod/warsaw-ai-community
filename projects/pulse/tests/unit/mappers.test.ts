// tests/unit/mappers.test.ts
import { describe, it, expect } from "vitest";
import { projectProps, decisionProps, releaseProps, engagementProps } from "../../lib/notion/mappers.js";

const SYNC = "2026-06-09T00:00:00.000Z";

describe("mappers", () => {
  it("projectProps: title=name, externalId=slug, select status/DRI, date sync", () => {
    const { externalId, properties } = projectProps(
      { slug: "gbrain", name: "GBrain", path: "projects/gbrain/", status: "Building", dri: "Anton", version: "v0.1.2", currentFocus: "E3", nextGate: "v0.2.0" },
      SYNC,
    );
    expect(externalId).toBe("gbrain");
    expect((properties["Name"] as any).title[0].text.content).toBe("GBrain");
    expect((properties["Status"] as any).select.name).toBe("Building");
    expect((properties["External ID"] as any).rich_text[0].text.content).toBe("gbrain");
    expect((properties["last_synced_at"] as any).date.start).toBe(SYNC);
  });

  it("decisionProps: externalId=ADR-id, url composed from repoUrl", () => {
    const { externalId, properties } = decisionProps(
      { id: "0017", adr: "ADR-0017", title: "Yuriy", status: "Accepted", date: "2026-06-09", path: "docs/decisions/0017-x.md" },
      SYNC, "https://github.com/anton1rsod/warsaw-ai-community",
    );
    expect(externalId).toBe("ADR-0017");
    expect((properties["ADR"] as any).title[0].text.content).toBe("ADR-0017");
    expect((properties["Link"] as any).url).toBe("https://github.com/anton1rsod/warsaw-ai-community/blob/main/docs/decisions/0017-x.md");
  });

  it("releaseProps: title=version, externalId=project@version", () => {
    const { externalId, properties } = releaseProps({ project: "gbrain", version: "0.1.1", date: "2026-04-26", summary: "x" }, SYNC);
    expect(externalId).toBe("gbrain@0.1.1");
    expect((properties["Project"] as any).select.name).toBe("gbrain");
  });

  it("engagementProps: numbers + externalId=handle", () => {
    const { externalId, properties } = engagementProps({ handle: "anton1rsod", name: "Anton", contributions: 385, kudos: 3, statusStreak: 2, eventsAttended: 1 }, SYNC);
    expect(externalId).toBe("anton1rsod");
    expect((properties["Contributions"] as any).number).toBe(385);
    expect((properties["Member"] as any).title[0].text.content).toBe("Anton");
  });
});
