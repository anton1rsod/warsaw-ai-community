import { describe, expect, it } from "vitest";
import {
  aggregateEventRosters,
  type RosterMemberInput,
  type EventRosterMap,
  type EventRosterEntry,
} from "@/scripts/build-event-rosters";
import { EventSlugSchema, type EventSlug } from "@/lib/events";

const VALID = EventSlugSchema.parse("2026-06-15-ai-hackathon-kickoff");
const VALID2 = EventSlugSchema.parse("2026-07-20-community-meetup");
// Stale slug that passes string format checks but is not in the known set
const ORPHAN = "2026-07-04-deleted-event" as EventSlug;

/** Unwrap rosters[slug] and fail fast if undefined. */
function getEntry(rosters: EventRosterMap, slug: string): EventRosterEntry {
  const entry = rosters[slug];
  if (!entry) throw new Error(`Expected entry for ${slug} but got undefined`);
  return entry;
}

describe("H32: event-rosters aggregation", () => {
  it("aggregates events_going + events_interested by slug", () => {
    const members: RosterMemberInput[] = [
      { slug: "alice", visibility: "public", going: [VALID], interested: [] },
      { slug: "bob", visibility: "members_only", going: [VALID], interested: [] },
      { slug: "carol", visibility: "public", going: [], interested: [VALID] },
    ];
    const known = new Set([VALID]);
    const rosters: EventRosterMap = aggregateEventRosters(members, known);
    expect(rosters[VALID]).toBeDefined();
    const r = getEntry(rosters, VALID);
    expect(r.going.publicSlugs).toEqual(["alice"]);
    expect(r.going.hiddenCount).toBe(1);
    expect(r.interested.publicSlugs).toEqual(["carol"]);
    expect(r.interested.hiddenCount).toBe(0);
  });

  it("H39: orphan slugs filtered (member has stale slug; not in known set)", () => {
    const members: RosterMemberInput[] = [
      { slug: "alice", visibility: "public", going: [VALID, ORPHAN], interested: [] },
    ];
    const known = new Set([VALID]);
    const rosters = aggregateEventRosters(members, known);
    expect(Object.keys(rosters)).toEqual([VALID]);
    expect(rosters[VALID]?.going.publicSlugs).toEqual(["alice"]);
  });

  it("empty members → empty rosters", () => {
    const known = new Set([VALID]);
    const rosters = aggregateEventRosters([], known);
    expect(rosters).toEqual({});
  });

  it("members with empty going/interested arrays → no entries", () => {
    const members: RosterMemberInput[] = [
      { slug: "alice", visibility: "public", going: [], interested: [] },
      { slug: "bob", visibility: "members_only", going: [], interested: [] },
    ];
    const known = new Set([VALID]);
    const rosters = aggregateEventRosters(members, known);
    expect(rosters).toEqual({});
  });

  it("publicSlugs sorted deterministically (avoid spurious diffs)", () => {
    const members: RosterMemberInput[] = [
      { slug: "zebra", visibility: "public", going: [VALID], interested: [] },
      { slug: "apple", visibility: "public", going: [VALID], interested: [] },
      { slug: "mango", visibility: "public", going: [VALID], interested: [] },
    ];
    const known = new Set([VALID]);
    const rosters = aggregateEventRosters(members, known);
    const entry = getEntry(rosters, VALID);
    expect(entry.going.publicSlugs).toEqual(["apple", "mango", "zebra"]);
  });

  it("multiple events tracked independently", () => {
    const members: RosterMemberInput[] = [
      { slug: "alice", visibility: "public", going: [VALID, VALID2], interested: [] },
      { slug: "bob", visibility: "public", going: [VALID2], interested: [VALID] },
    ];
    const known = new Set([VALID, VALID2]);
    const rosters = aggregateEventRosters(members, known);

    const ev1 = getEntry(rosters, VALID);
    const ev2 = getEntry(rosters, VALID2);
    expect(ev1.going.publicSlugs).toEqual(["alice"]);
    expect(ev1.interested.publicSlugs).toEqual(["bob"]);
    expect(ev2.going.publicSlugs).toEqual(["alice", "bob"]);
    expect(ev2.interested.publicSlugs).toEqual([]);
  });

  it("members_only visibility increments hiddenCount for interested too", () => {
    const members: RosterMemberInput[] = [
      { slug: "private-member", visibility: "members_only", going: [], interested: [VALID] },
    ];
    const known = new Set([VALID]);
    const rosters = aggregateEventRosters(members, known);
    const entry = getEntry(rosters, VALID);
    expect(entry.interested.hiddenCount).toBe(1);
    expect(entry.interested.publicSlugs).toEqual([]);
  });

  it("event not in known set is fully ignored (even if valid slug format)", () => {
    const orphanSlug = EventSlugSchema.parse("2026-08-01-future-event");
    const members: RosterMemberInput[] = [
      { slug: "alice", visibility: "public", going: [orphanSlug], interested: [] },
    ];
    const known = new Set([VALID]); // orphanSlug not in known
    const rosters = aggregateEventRosters(members, known);
    expect(Object.keys(rosters)).toEqual([]);
  });
});
