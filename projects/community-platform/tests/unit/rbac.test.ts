import { describe, expect, it } from "vitest";
import type { RosterMember } from "@/lib/roster";
import type { GovernanceSnapshot } from "@/lib/governance";
import { resolveRole, isPrivileged, type Role } from "@/lib/rbac";

const roster: RosterMember[] = [
  { name: "Anton Safronov", githubHandle: "anton1rsod", slug: "anton-safronov" },
  { name: "Alice Example", githubHandle: "alice-ex", slug: "alice-example" },
  { name: "Bob Sample", githubHandle: "bob-sample", slug: "bob-sample" },
];

function makeGov(opts: {
  admins?: readonly string[];
  cms?: readonly string[];
}): GovernanceSnapshot {
  const admins = new Set(opts.admins ?? []);
  const cms = new Set(opts.cms ?? []);
  const norm = (h: string): string =>
    h.replace(/^@/, "").toLowerCase().trim();
  return {
    admins: [...admins],
    communityManagers: [...cms],
    isAdmin: (h) => (h ? admins.has(norm(h)) : false),
    isCommunityManager: (h) => (h ? cms.has(norm(h)) : false),
  };
}

describe("resolveRole", () => {
  it("returns 'admin' when handle is on roster AND in admins list", () => {
    const gov = makeGov({ admins: ["anton1rsod"] });
    expect(resolveRole("anton1rsod", { roster, governance: gov })).toBe<Role>("admin");
  });

  it("returns 'community_manager' when handle is on roster AND in CM list", () => {
    const gov = makeGov({ cms: ["alice-ex"] });
    expect(resolveRole("alice-ex", { roster, governance: gov })).toBe<Role>("community_manager");
  });

  it("admin trumps community_manager (governance precedence)", () => {
    const gov = makeGov({ admins: ["anton1rsod"], cms: ["anton1rsod"] });
    expect(resolveRole("anton1rsod", { roster, governance: gov })).toBe<Role>("admin");
  });

  it("returns 'member' for roster handle without governance role", () => {
    const gov = makeGov({});
    expect(resolveRole("bob-sample", { roster, governance: gov })).toBe<Role>("member");
  });

  it("returns 'guest' for unknown handle", () => {
    const gov = makeGov({ admins: ["anton1rsod"] });
    expect(resolveRole("stranger", { roster, governance: gov })).toBe<Role>("guest");
  });

  it("admin handle that is NOT on roster resolves to 'guest' (must-be-on-roster invariant)", () => {
    const gov = makeGov({ admins: ["ghost"] });
    expect(resolveRole("ghost", { roster, governance: gov })).toBe<Role>("guest");
  });

  it("CM handle that is NOT on roster resolves to 'guest'", () => {
    const gov = makeGov({ cms: ["phantom"] });
    expect(resolveRole("phantom", { roster, governance: gov })).toBe<Role>("guest");
  });

  it("normalizes handle case before lookup", () => {
    const gov = makeGov({ admins: ["anton1rsod"] });
    expect(resolveRole("Anton1RSOD", { roster, governance: gov })).toBe<Role>("admin");
  });

  it("strips a leading @ before lookup", () => {
    const gov = makeGov({ admins: ["anton1rsod"] });
    expect(resolveRole("@anton1rsod", { roster, governance: gov })).toBe<Role>("admin");
  });

  it("returns 'guest' for empty handle", () => {
    const gov = makeGov({ admins: ["anton1rsod"] });
    expect(resolveRole("", { roster, governance: gov })).toBe<Role>("guest");
  });
});

describe("isPrivileged", () => {
  it("admin is privileged", () => {
    expect(isPrivileged("admin")).toBe(true);
  });
  it("community_manager is privileged", () => {
    expect(isPrivileged("community_manager")).toBe(true);
  });
  it("member is not privileged", () => {
    expect(isPrivileged("member")).toBe(false);
  });
  it("guest is not privileged", () => {
    expect(isPrivileged("guest")).toBe(false);
  });
});
