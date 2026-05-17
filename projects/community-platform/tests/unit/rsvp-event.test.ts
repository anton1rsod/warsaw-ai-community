import { describe, it, expect, vi, beforeEach } from "vitest";
import type * as GitHubAppModule from "@/lib/github-app";

const mockAuth = vi.fn();
const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));
vi.mock("@/lib/env", () => ({
  env: {
    GITHUB_APP_ID: "x",
    GITHUB_APP_PRIVATE_KEY: "x",
    GITHUB_APP_INSTALLATION_ID: "x",
    GITHUB_REPO_OWNER: "anton1rsod",
    GITHUB_REPO_NAME: "warsaw-ai-community",
    GITHUB_REPO_BRANCH: "main",
  },
}));
vi.mock("@/lib/github-app", async () => {
  const actual = await vi.importActual<typeof GitHubAppModule>("@/lib/github-app");
  return {
    ...actual,
    createGitHubApp: () => ({
      readFile: mockReadFile,
      writeFile: mockWriteFile,
    }),
  };
});
vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: (h: string) =>
    h === "anton1rsod" ? { slug: "anton-safronov", name: "Anton" } : undefined,
  listEventsFromSnapshot: () => [
    {
      date: "2026-06-15",
      slug: "2026-06-15-hack",
      title: "X",
      body: "",
      status: "scheduled",
    },
  ],
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { rsvpEvent } from "@/app/actions/rsvp-event";
import { GitHubAppError } from "@/lib/github-app";

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ githubHandle: "anton1rsod" });
});

const validInput = {
  eventSlug: "2026-06-15-hack",
  desiredState: "going" as const,
  profileSha: "abc123",
};

describe("H31: SHA-gated write", () => {
  it("calls writeFile with sha from input on happy path", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\n---\nbody\n",
      sha: "abc123",
      path: "community/members/anton-safronov.md",
    });
    mockWriteFile.mockResolvedValue({
      content: "x",
      sha: "newSha",
      path: "x",
    });
    const r = await rsvpEvent(validInput);
    expect(r.ok).toBe(true);
    expect(mockWriteFile).toHaveBeenCalledWith(
      "community/members/anton-safronov.md",
      expect.any(String),
      expect.objectContaining({ sha: "abc123" }),
    );
  });

  it("returns refresh_needed when loaded SHA does NOT match current file SHA (pre-write check)", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\n---\nbody\n",
      sha: "differentSha",
      path: "x",
    });
    const r = await rsvpEvent(validInput);
    expect(r.ok).toBe(false);
    expect((r as { error: string }).error).toBe("refresh_needed");
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});

describe("H40: 409 → REFRESH_NEEDED (no retry)", () => {
  it("on sha_conflict from writeFile, returns refresh_needed without retry", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    const conflictErr = new GitHubAppError("sha_conflict", "conflict");
    mockWriteFile.mockRejectedValue(conflictErr);
    const r = await rsvpEvent(validInput);
    expect(r.ok).toBe(false);
    expect((r as { error: string }).error).toBe("refresh_needed");
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });

  it("on non-sha_conflict GitHubAppError, returns internal_error", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockRejectedValue(
      new GitHubAppError("not_found", "missing"),
    );
    const r = await rsvpEvent(validInput);
    expect((r as { error: string }).error).toBe("internal_error");
  });

  it("on plain Error from writeFile, returns internal_error", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockRejectedValue(new Error("network down"));
    const r = await rsvpEvent(validInput);
    expect((r as { error: string }).error).toBe("internal_error");
  });
});

describe("H37: event slug validation", () => {
  it("unknown slug → event_not_found", async () => {
    const r = await rsvpEvent({
      ...validInput,
      eventSlug: "2026-99-99-nope",
    });
    expect((r as { error: string }).error).toBe("event_not_found");
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("malformed slug → event_not_found", async () => {
    const r = await rsvpEvent({ ...validInput, eventSlug: "not-a-slug" });
    expect((r as { error: string }).error).toBe("event_not_found");
  });
});

describe("D11: mutual exclusion reconciliation", () => {
  it("desiredState=going moves slug from interested → going", async () => {
    mockReadFile.mockResolvedValue({
      content:
        "---\nname: Anton\nevents_interested:\n  - 2026-06-15-hack\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    await rsvpEvent({ ...validInput, desiredState: "going" });
    const writtenContent = mockWriteFile.mock.calls[0]?.[1] ?? "";
    expect(writtenContent).toMatch(/events_going[\s\S]*2026-06-15-hack/);
    expect(writtenContent).not.toMatch(
      /events_interested[\s\S]*2026-06-15-hack/,
    );
  });

  it("desiredState=none removes from both arrays", async () => {
    mockReadFile.mockResolvedValue({
      content:
        "---\nname: Anton\nevents_going:\n  - 2026-06-15-hack\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    await rsvpEvent({ ...validInput, desiredState: "none" });
    const writtenContent = mockWriteFile.mock.calls[0]?.[1] ?? "";
    expect(writtenContent).not.toMatch(
      /events_going[\s\S]*2026-06-15-hack/,
    );
    expect(writtenContent).not.toMatch(
      /events_interested[\s\S]*2026-06-15-hack/,
    );
  });

  it("desiredState=interested moves slug from going → interested", async () => {
    mockReadFile.mockResolvedValue({
      content:
        "---\nname: Anton\nevents_going:\n  - 2026-06-15-hack\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    await rsvpEvent({ ...validInput, desiredState: "interested" });
    const writtenContent = mockWriteFile.mock.calls[0]?.[1] ?? "";
    expect(writtenContent).toMatch(
      /events_interested[\s\S]*2026-06-15-hack/,
    );
  });
});

describe("H46: visibility default on first RSVP", () => {
  it("sets event_rsvp_visibility=members_only when absent", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    await rsvpEvent(validInput);
    const writtenContent = mockWriteFile.mock.calls[0]?.[1] ?? "";
    expect(writtenContent).toMatch(
      /event_rsvp_visibility:\s*members_only/,
    );
  });

  it("preserves event_rsvp_visibility=public when already set", async () => {
    mockReadFile.mockResolvedValue({
      content:
        "---\nname: Anton\nevent_rsvp_visibility: public\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    await rsvpEvent(validInput);
    const writtenContent = mockWriteFile.mock.calls[0]?.[1] ?? "";
    expect(writtenContent).toMatch(/event_rsvp_visibility:\s*public/);
  });
});

describe("auth + roster gates", () => {
  it("not authenticated → not_authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const r = await rsvpEvent(validInput);
    expect((r as { error: string }).error).toBe("not_authenticated");
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("not on roster → not_a_member", async () => {
    mockAuth.mockResolvedValue({ githubHandle: "stranger" });
    const r = await rsvpEvent(validInput);
    expect((r as { error: string }).error).toBe("not_a_member");
  });
});

describe("input validation", () => {
  it("invalid input → invalid_input", async () => {
    const r = await rsvpEvent({
      eventSlug: "x",
      desiredState: "weird" as never,
      profileSha: "",
    });
    expect((r as { error: string }).error).toBe("invalid_input");
  });

  it("readFile returns null → internal_error", async () => {
    mockReadFile.mockResolvedValue(null);
    const r = await rsvpEvent(validInput);
    expect((r as { error: string }).error).toBe("internal_error");
  });
});
