import { describe, expect, it } from "vitest";
import { aggregateKudos, type ThanksRecord, type GiverInput } from "@/scripts/build-kudos-aggregate";

const A_TO_B: ThanksRecord = { recipient: "bob", item_type: "status", item_id: "2026-W19/bob", given_at: "2026-05-12T10:00:00Z" };
const A_TO_BOT: ThanksRecord = { recipient: "warsaw-ai-bot", item_type: "status", item_id: "x", given_at: "2026-05-12T10:00:00Z" };
const NONROSTER_TO_B: ThanksRecord = { recipient: "bob", item_type: "status", item_id: "y", given_at: "2026-05-12T10:00:00Z" };

describe("H54: kudos aggregator filters", () => {
  it("excludes bot recipients (BOT_AUTHORS)", () => {
    const givers: GiverInput[] = [{ slug: "alice", thanks_given: [A_TO_B, A_TO_BOT] }];
    const roster = new Set(["alice", "bob"]);
    const botAuthors = new Set(["warsaw-ai-bot"]);
    const agg = aggregateKudos(givers, roster, botAuthors);
    expect(agg["bob"]?.total).toBe(1);
    expect(agg["warsaw-ai-bot"]).toBeUndefined();
  });

  it("excludes non-roster givers", () => {
    const givers: GiverInput[] = [
      { slug: "alice", thanks_given: [A_TO_B] },
      { slug: "carol-not-on-roster", thanks_given: [NONROSTER_TO_B] },
    ];
    const roster = new Set(["alice", "bob"]);
    const agg = aggregateKudos(givers, roster, new Set());
    expect(agg["bob"]?.total).toBe(1);
  });

  it("recent capped at 5 entries, sorted desc by given_at", () => {
    const records: ThanksRecord[] = Array.from({ length: 7 }, (_, i) => ({
      recipient: "bob",
      item_type: "status",
      item_id: `id-${i}`,
      given_at: `2026-05-${String(10 + i).padStart(2, "0")}T10:00:00Z`,
    }));
    const givers: GiverInput[] = [{ slug: "alice", thanks_given: records }];
    const roster = new Set(["alice", "bob"]);
    const agg = aggregateKudos(givers, roster, new Set());
    expect(agg["bob"]?.recent.length).toBe(5);
    expect(agg["bob"]?.recent[0]?.item_id).toBe("id-6");
  });

  it("by_type counts split by item_type", () => {
    const givers: GiverInput[] = [{
      slug: "alice",
      thanks_given: [
        { recipient: "bob", item_type: "status", item_id: "1", given_at: "2026-05-12T10:00:00Z" },
        { recipient: "bob", item_type: "status", item_id: "2", given_at: "2026-05-13T10:00:00Z" },
        { recipient: "bob", item_type: "contribution", item_id: "3", given_at: "2026-05-14T10:00:00Z" },
        { recipient: "bob", item_type: "meeting", item_id: "4", given_at: "2026-05-15T10:00:00Z" },
      ],
    }];
    const roster = new Set(["alice", "bob"]);
    const agg = aggregateKudos(givers, roster, new Set());
    expect(agg["bob"]?.by_type).toEqual({ status: 2, contribution: 1, meeting: 1 });
  });
});
