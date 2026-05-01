import { describe, expect, it } from "vitest";
import {
  findMemberByHandle,
  findMemberBySlug,
  isAdmin,
  isCommunityManager,
  listMembers,
  snapshot,
} from "@/lib/content-snapshot";

describe("content-snapshot", () => {
  it("exposes a generatedAt ISO timestamp", () => {
    expect(typeof snapshot.generatedAt).toBe("string");
    expect(() => new Date(snapshot.generatedAt).toISOString()).not.toThrow();
  });

  it("exposes a members array and a governance object with arrays", () => {
    expect(Array.isArray(snapshot.members)).toBe(true);
    expect(Array.isArray(snapshot.governance.admins)).toBe(true);
    expect(Array.isArray(snapshot.governance.communityManagers)).toBe(true);
  });
});

describe("isAdmin", () => {
  it("returns true for the founder handle (case-insensitive, @-tolerant)", () => {
    expect(isAdmin("anton1rsod")).toBe(true);
    expect(isAdmin("ANTON1RSOD")).toBe(true);
    expect(isAdmin("@anton1rsod")).toBe(true);
  });

  it("returns false for handles not in the admins list", () => {
    expect(isAdmin("stranger")).toBe(false);
  });

  it("returns false for empty handle", () => {
    expect(isAdmin("")).toBe(false);
  });
});

describe("isCommunityManager", () => {
  it("returns false for any handle when CM list is empty", () => {
    // v0.1 launch state: communityManagers is empty.
    if (snapshot.governance.communityManagers.length === 0) {
      expect(isCommunityManager("anyone")).toBe(false);
      expect(isCommunityManager("anton1rsod")).toBe(false);
    } else {
      // Future-proof: if roster grows to include CMs, ensure normalization works.
      const cm = snapshot.governance.communityManagers[0];
      if (cm !== undefined) {
        expect(isCommunityManager(cm.toUpperCase())).toBe(true);
      }
    }
  });

  it("returns false for empty handle", () => {
    expect(isCommunityManager("")).toBe(false);
  });
});

describe("findMemberByHandle", () => {
  it("finds the founder by exact handle", () => {
    const member = findMemberByHandle("anton1rsod");
    expect(member?.name).toBe("Anton Safronov");
    expect(member?.slug).toBe("anton-safronov");
  });

  it("matches @-prefixed input", () => {
    expect(findMemberByHandle("@anton1rsod")?.githubHandle).toBe("anton1rsod");
  });

  it("matches case-insensitively", () => {
    expect(findMemberByHandle("Anton1RSOD")?.githubHandle).toBe("anton1rsod");
  });

  it("returns undefined for unknown handle", () => {
    expect(findMemberByHandle("stranger")).toBeUndefined();
  });

  it("returns undefined for empty handle", () => {
    expect(findMemberByHandle("")).toBeUndefined();
  });
});

describe("findMemberBySlug", () => {
  it("finds the founder by slug", () => {
    const member = findMemberBySlug("anton-safronov");
    expect(member?.name).toBe("Anton Safronov");
    expect(member?.githubHandle).toBe("anton1rsod");
  });

  it("returns undefined for unknown slug", () => {
    expect(findMemberBySlug("ghost")).toBeUndefined();
  });
});

describe("listMembers", () => {
  it("returns the full members array", () => {
    const members = listMembers();
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBe(snapshot.members.length);
  });

  it("each member has required RosterMember fields", () => {
    for (const m of listMembers()) {
      expect(typeof m.name).toBe("string");
      expect(typeof m.githubHandle).toBe("string");
      expect(typeof m.slug).toBe("string");
    }
  });

  it("each member has profile and persona fields (may be null)", () => {
    for (const m of listMembers()) {
      expect("profile" in m).toBe(true);
      expect("persona" in m).toBe(true);
    }
  });
});
