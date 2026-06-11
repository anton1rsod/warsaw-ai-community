// tests/unit/is-admin-failsafe.test.ts
//
// H163 — isAdmin fail-safe: empty/invalid/missing allowlist ⇒ deny-all.
// Tests that malformed governance data never grants admin access.
// Written BEFORE verifying production behaviour (TDD).

import { describe, it, expect, vi, beforeEach } from "vitest";

// We want to test what `isAdmin` does when the snapshot's governance.admins
// is empty, undefined, or otherwise malformed. The real module imports the
// snapshot JSON at module load time; we need to mock the snapshot to inject
// bad data.

beforeEach(() => {
  vi.resetModules();
});

describe("H163 — isAdmin deny-all when allowlist is empty or malformed", () => {
  it("returns false for any handle when governance.admins is an empty array", async () => {
    vi.doMock("@/lib/__generated__/content-snapshot.json", () => ({
      default: {
        generatedAt: "2026-01-01T00:00:00Z",
        members: [],
        governance: {
          admins: [],
          communityManagers: [],
        },
        projects: [],
        decisions: [],
        meetings: [],
        events: [],
      },
    }));
    vi.doMock("@/lib/__generated__/contributions.json", () => ({ default: {} }));
    vi.doMock("@/lib/__generated__/project-contributions.json", () => ({
      default: {},
    }));

    const { isAdmin } = await import("@/lib/content-snapshot");

    expect(isAdmin("anton1rsod")).toBe(false);
    expect(isAdmin("anyone")).toBe(false);
    expect(isAdmin("")).toBe(false);
    expect(isAdmin("ADMIN")).toBe(false);
  });

  it("returns false for any handle when governance.admins is undefined/null (defensive guard)", async () => {
    vi.doMock("@/lib/__generated__/content-snapshot.json", () => ({
      default: {
        generatedAt: "2026-01-01T00:00:00Z",
        members: [],
        governance: {
          // admins field intentionally absent to simulate malformed JSON
          communityManagers: [],
        },
        projects: [],
        decisions: [],
        meetings: [],
        events: [],
      },
    }));
    vi.doMock("@/lib/__generated__/contributions.json", () => ({ default: {} }));
    vi.doMock("@/lib/__generated__/project-contributions.json", () => ({
      default: {},
    }));

    const { isAdmin } = await import("@/lib/content-snapshot");

    expect(isAdmin("anton1rsod")).toBe(false);
    expect(isAdmin("anyone")).toBe(false);
  });

  it("returns false for empty string handle even with a populated allowlist", async () => {
    // This is the existing behaviour — confirming the guard is not regressed.
    const { isAdmin } = await import("@/lib/content-snapshot");
    expect(isAdmin("")).toBe(false);
  });
});
