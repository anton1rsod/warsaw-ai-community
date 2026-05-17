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
  const actual =
    await vi.importActual<typeof GitHubAppModule>("@/lib/github-app");
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
    h === "alice"
      ? { slug: "alice", name: "Alice" }
      : h === "bob"
        ? { slug: "bob", name: "Bob" }
        : undefined,
  findMemberBySlug: (s: string) =>
    s === "alice"
      ? { slug: "alice" }
      : s === "bob"
        ? { slug: "bob" }
        : undefined,
  findProjectBySlug: (s: string) =>
    s === "community-platform" ? { slug: "community-platform" } : undefined,
  findMeetingBySlug: (s: string) =>
    s === "2026-05-19" ? { slug: "2026-05-19" } : undefined,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { thankStatus } from "@/app/actions/thank-status";
import { GitHubAppError } from "@/lib/github-app";
import { revalidatePath } from "next/cache";

const mockRevalidate = vi.mocked(revalidatePath);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ githubHandle: "alice" });
});

const validInput = {
  recipient: "bob",
  item_type: "status" as const,
  item_id: "2026-W19/bob",
  profileSha: "abc123",
};

describe("H53: thank-status SHA passthrough + dedup", () => {
  it("happy path writes thanks_given record + commits", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Alice\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    const r = await thankStatus(validInput);
    expect(r).toEqual({ ok: true });
    expect(mockWriteFile).toHaveBeenCalled();
    const writtenContent = mockWriteFile.mock.calls[0]?.[1] ?? "";
    expect(writtenContent).toMatch(/thanks_given/);
    expect(writtenContent).toMatch(/recipient[\s\S]*bob/);
    expect(writtenContent).toMatch(/item_type[\s\S]*status/);
    expect(writtenContent).toMatch(/item_id[\s\S]*2026-W19\/bob/);
  });

  it("O7 dedup: triple already present → already_thanked, no commit", async () => {
    const existing =
      "---\nname: Alice\nthanks_given:\n  - recipient: bob\n    item_type: status\n    item_id: 2026-W19/bob\n    given_at: \"2026-05-12T10:00:00Z\"\n---\nbody\n";
    mockReadFile.mockResolvedValue({
      content: existing,
      sha: "abc123",
      path: "x",
    });
    const r = await thankStatus(validInput);
    expect(r).toEqual({ ok: true, already_thanked: true });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("dedup miss when only one of three fields differs", async () => {
    const existing =
      "---\nname: Alice\nthanks_given:\n  - recipient: bob\n    item_type: status\n    item_id: different-id\n    given_at: \"2026-05-12T10:00:00Z\"\n---\nbody\n";
    mockReadFile.mockResolvedValue({
      content: existing,
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    const r = await thankStatus(validInput);
    expect(r).toEqual({ ok: true });
    expect(mockWriteFile).toHaveBeenCalled();
  });
});

describe("H53: SHA gate (refresh_needed)", () => {
  it("pre-write SHA mismatch → refresh_needed (no writeFile)", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Alice\n---\nbody\n",
      sha: "differentSha",
      path: "x",
    });
    const r = await thankStatus(validInput);
    expect(r).toEqual({ ok: false, error: "refresh_needed" });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("409 from writeFile → refresh_needed (no retry)", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Alice\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockRejectedValue(
      new GitHubAppError("sha_conflict", "conflict"),
    );
    const r = await thankStatus(validInput);
    expect(r).toEqual({ ok: false, error: "refresh_needed" });
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });

  it("non-sha_conflict GitHubAppError → internal_error", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Alice\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockRejectedValue(
      new GitHubAppError("not_found", "missing"),
    );
    const r = await thankStatus(validInput);
    expect((r as { error: string }).error).toBe("internal_error");
  });

  it("plain Error → internal_error", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Alice\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockRejectedValue(new Error("network"));
    const r = await thankStatus(validInput);
    expect((r as { error: string }).error).toBe("internal_error");
  });
});

describe("H53: self-thank blocked", () => {
  it("recipient === giver.slug → self_thank_blocked, no read/write", async () => {
    const r = await thankStatus({ ...validInput, recipient: "alice" });
    expect(r).toEqual({ ok: false, error: "self_thank_blocked" });
    expect(mockReadFile).not.toHaveBeenCalled();
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});

describe("H53: non-roster recipient blocked", () => {
  it("unknown recipient → recipient_not_found", async () => {
    const r = await thankStatus({ ...validInput, recipient: "stranger" });
    expect((r as { error: string }).error).toBe("recipient_not_found");
  });
});

describe("O8: item_id validators per item_type", () => {
  it("status with malformed item_id (no W token) → item_not_found", async () => {
    const r = await thankStatus({ ...validInput, item_id: "no-week-token" });
    expect((r as { error: string }).error).toBe("item_not_found");
  });

  it("status with valid shape → ok (server doesn't verify post existence)", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Alice\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    const r = await thankStatus({ ...validInput, item_id: "2026-W22/bob" });
    expect(r).toEqual({ ok: true });
  });

  it("contribution validates both projectSlug AND contributorSlug", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Alice\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    const r = await thankStatus({
      ...validInput,
      item_type: "contribution",
      item_id: "community-platform:bob",
    });
    expect(r).toEqual({ ok: true });
  });

  it("contribution with unknown projectSlug → item_not_found", async () => {
    const r = await thankStatus({
      ...validInput,
      item_type: "contribution",
      item_id: "no-project:bob",
    });
    expect((r as { error: string }).error).toBe("item_not_found");
  });

  it("contribution with unknown contributorSlug → item_not_found", async () => {
    const r = await thankStatus({
      ...validInput,
      item_type: "contribution",
      item_id: "community-platform:stranger",
    });
    expect((r as { error: string }).error).toBe("item_not_found");
  });

  it("contribution with malformed item_id (no colon) → item_not_found", async () => {
    const r = await thankStatus({
      ...validInput,
      item_type: "contribution",
      item_id: "no-colon",
    });
    expect((r as { error: string }).error).toBe("item_not_found");
  });

  it("meeting item_id validates against findMeetingBySlug", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Alice\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    const r = await thankStatus({
      ...validInput,
      item_type: "meeting",
      item_id: "2026-05-19",
    });
    expect(r).toEqual({ ok: true });
  });

  it("meeting with unknown date → item_not_found", async () => {
    const r = await thankStatus({
      ...validInput,
      item_type: "meeting",
      item_id: "2026-99-99",
    });
    expect((r as { error: string }).error).toBe("item_not_found");
  });

  it("meeting revalidates /meetings/[slug] on success", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Alice\n---\nbody\n",
      sha: "abc123",
      path: "x",
    });
    mockWriteFile.mockResolvedValue({ content: "x", sha: "n", path: "x" });
    await thankStatus({
      ...validInput,
      item_type: "meeting",
      item_id: "2026-05-19",
    });
    expect(mockRevalidate).toHaveBeenCalledWith("/meetings/2026-05-19");
  });
});

describe("auth + roster gates", () => {
  it("not authenticated → not_authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const r = await thankStatus(validInput);
    expect((r as { error: string }).error).toBe("not_authenticated");
  });

  it("giver not on roster → not_a_member", async () => {
    mockAuth.mockResolvedValue({ githubHandle: "stranger" });
    const r = await thankStatus(validInput);
    expect((r as { error: string }).error).toBe("not_a_member");
  });
});

describe("input validation", () => {
  it("missing profileSha → invalid_input", async () => {
    const r = await thankStatus({ ...validInput, profileSha: "" });
    expect((r as { error: string }).error).toBe("invalid_input");
  });

  it("invalid item_type → invalid_input", async () => {
    const r = await thankStatus({
      ...validInput,
      item_type: "bogus" as never,
    });
    expect((r as { error: string }).error).toBe("invalid_input");
  });

  it("readFile returns null → internal_error", async () => {
    mockReadFile.mockResolvedValue(null);
    const r = await thankStatus(validInput);
    expect((r as { error: string }).error).toBe("internal_error");
  });
});
