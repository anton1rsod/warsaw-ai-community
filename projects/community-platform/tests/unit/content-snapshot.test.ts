import { describe, expect, it } from "vitest";
import {
  findDecisionBySlug,
  findMeetingBySlug,
  findMemberByHandle,
  findMemberBySlug,
  findProjectBySlug,
  isAdmin,
  isCommunityManager,
  listDecisionsFromSnapshot,
  listMeetingsFromSnapshot,
  listMembers,
  listProjectDetails,
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

describe("listProjectDetails", () => {
  it("returns the full projects array from the snapshot", () => {
    const projects = listProjectDetails();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBe(snapshot.projects.length);
  });

  it("each project has slug, title, and optional markdown fields", () => {
    for (const p of listProjectDetails()) {
      expect(typeof p.slug).toBe("string");
      expect(typeof p.title).toBe("string");
      expect(p.readme === null || typeof p.readme === "string").toBe(true);
      expect(p.spec === null || typeof p.spec === "string").toBe(true);
      expect(p.plan === null || typeof p.plan === "string").toBe(true);
      expect(p.changelog === null || typeof p.changelog === "string").toBe(true);
    }
  });
});

describe("findProjectBySlug", () => {
  it("finds an existing project by slug", () => {
    const project = findProjectBySlug("community-platform");
    expect(project).not.toBeUndefined();
    expect(project?.slug).toBe("community-platform");
    expect(typeof project?.title).toBe("string");
  });

  it("returns undefined for an unknown slug", () => {
    expect(findProjectBySlug("no-such-project")).toBeUndefined();
  });
});

describe("listDecisionsFromSnapshot", () => {
  it("returns the full decisions array from the snapshot", () => {
    const decisions = listDecisionsFromSnapshot();
    expect(Array.isArray(decisions)).toBe(true);
    expect(decisions.length).toBe(snapshot.decisions.length);
  });

  it("each decision has number, slug, title, and body fields", () => {
    for (const d of listDecisionsFromSnapshot()) {
      expect(typeof d.number).toBe("number");
      expect(typeof d.slug).toBe("string");
      expect(typeof d.title).toBe("string");
      expect(typeof d.body).toBe("string");
    }
  });
});

describe("findDecisionBySlug", () => {
  it("finds an existing decision by slug", () => {
    const decisions = listDecisionsFromSnapshot();
    if (decisions.length > 0) {
      const first = decisions[0];
      if (first !== undefined) {
        const found = findDecisionBySlug(first.slug);
        expect(found).not.toBeUndefined();
        expect(found?.slug).toBe(first.slug);
      }
    }
  });

  it("returns undefined for an unknown slug", () => {
    expect(findDecisionBySlug("9999-no-such-decision")).toBeUndefined();
  });
});

describe("listMeetingsFromSnapshot", () => {
  it("returns the full meetings array from the snapshot", () => {
    const meetings = listMeetingsFromSnapshot();
    expect(Array.isArray(meetings)).toBe(true);
    expect(meetings.length).toBe(snapshot.meetings.length);
  });

  it("each meeting has slug, date, title, body, and attendees fields", () => {
    for (const m of listMeetingsFromSnapshot()) {
      expect(typeof m.slug).toBe("string");
      expect(typeof m.date).toBe("string");
      expect(typeof m.title).toBe("string");
      expect(typeof m.body).toBe("string");
      expect(Array.isArray(m.attendees)).toBe(true);
    }
  });
});

describe("findMeetingBySlug", () => {
  it("returns undefined for a non-existent slug", () => {
    expect(findMeetingBySlug("9999-99-99")).toBeUndefined();
  });

  it("finds an existing meeting when meetings are present", () => {
    const meetings = listMeetingsFromSnapshot();
    if (meetings.length > 0) {
      const first = meetings[0];
      if (first !== undefined) {
        const found = findMeetingBySlug(first.slug);
        expect(found).not.toBeUndefined();
        expect(found?.slug).toBe(first.slug);
      }
    }
  });
});
