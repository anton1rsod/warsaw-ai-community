import { describe, expect, it } from "vitest";
import {
  findMemberByHandle,
  isAdmin,
  isCommunityManager,
  snapshot,
} from "@/lib/content-snapshot";

describe("content-snapshot", () => {
  it("exposes a generatedAt ISO timestamp", () => {
    expect(typeof snapshot.generatedAt).toBe("string");
    expect(() => new Date(snapshot.generatedAt).toISOString()).not.toThrow();
  });

  it("exposes a roster array and a governance object with arrays", () => {
    expect(Array.isArray(snapshot.roster)).toBe(true);
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
