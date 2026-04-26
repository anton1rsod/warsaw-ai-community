import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleForget } from "../../src/commands/forget";

const fakeStore = {
  commit: vi.fn(async () => "sha1"),
  remove: vi.fn(async () => "sha2")
};

beforeEach(() => {
  // Reset shared mock between tests so call-count assertions don't see
  // residual invocations from earlier tests.
  fakeStore.commit.mockClear();
  fakeStore.remove.mockClear();
});

describe("handleForget", () => {
  it("parses archive path from a valid archive URL and calls remove()", async () => {
    const res = await handleForget({
      authorId: 99,
      isCoreOrganizer: false,
      messageText:
        "/gbrain-forget https://github.com/warsaw-ai/community/blob/main/community/archive/2026-04/2026-04-24-guides-hello.md",
      store: fakeStore as never,
      ownerOfPath: async () => 99 // same author = allowed
    });
    expect(res.ok).toBe(true);
    expect(fakeStore.remove).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "community/archive/2026-04/2026-04-24-guides-hello.md"
      })
    );
  });

  it("rejects forgetting someone else's content when not a core organizer", async () => {
    const res = await handleForget({
      authorId: 42,
      isCoreOrganizer: false,
      messageText: "/gbrain-forget community/archive/2026-04/foo.md",
      store: { commit: vi.fn(), remove: vi.fn(async () => "x") } as never,
      ownerOfPath: async () => 99
    });
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/not your content/i);
  });

  it("allows a core organizer to forget any content", async () => {
    const store = {
      commit: vi.fn(async () => "x"),
      remove: vi.fn(async () => "y")
    };
    const res = await handleForget({
      authorId: 1,
      isCoreOrganizer: true,
      messageText: "/gbrain-forget community/archive/2026-04/foo.md",
      store: store as never,
      ownerOfPath: async () => 99
    });
    expect(res.ok).toBe(true);
    expect(store.remove).toHaveBeenCalled();
  });

  it("returns an error when the message lacks a path", async () => {
    const res = await handleForget({
      authorId: 1,
      isCoreOrganizer: false,
      messageText: "/gbrain-forget",
      store: fakeStore as never,
      ownerOfPath: async () => 1
    });
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/path/i);
  });

  // Spec §10: "Bot removes the markdown file and commits a removal record
  // (community/archive/_removed/YYYY-MM-DD.md with hash only, no content)."
  // Must work both with and without ARCHIVE_NAMESPACE.
  it("commits a tombstone in _removed/YYYY-MM-DD.md after a successful remove", async () => {
    const store = {
      commit: vi.fn(async () => "tombstone-sha"),
      remove: vi.fn(async () => "removed-sha")
    };
    const fixedNow = new Date("2026-04-26T15:00:00Z");
    const res = await handleForget({
      authorId: 99,
      isCoreOrganizer: false,
      messageText: "/gbrain-forget community/archive/2026-04/2026-04-24-guides-hello.md",
      store: store as never,
      ownerOfPath: async () => 99,
      now: fixedNow
    });
    expect(res.ok).toBe(true);
    expect(store.remove).toHaveBeenCalledOnce();
    expect(store.commit).toHaveBeenCalledOnce();
    const calls = store.commit.mock.calls as unknown as Array<[{ path: string; content: string }]>;
    const commitArg = calls[0]?.[0];
    if (!commitArg) throw new Error("expected store.commit to be called");
    expect(commitArg.path).toBe("community/archive/_removed/2026-04-26.md");
    // Spec: hash only, no content
    expect(commitArg.content).toMatch(/^# Removed records — 2026-04-26/);
    expect(commitArg.content).toContain("hash:");
    expect(commitArg.content).not.toContain("hello"); // original slug not in tombstone
    expect(commitArg.content).toContain("requested_by: 99");
  });

  it("namespaces the tombstone path when archiveNamespace is provided", async () => {
    const store = { commit: vi.fn(async () => "x"), remove: vi.fn(async () => "y") };
    const res = await handleForget({
      authorId: 99,
      isCoreOrganizer: false,
      messageText: "/gbrain-forget community/archive/_staging/2026-04/foo.md",
      store: store as never,
      ownerOfPath: async () => 99,
      archiveNamespace: "_staging",
      now: new Date("2026-04-26T15:00:00Z")
    });
    expect(res.ok).toBe(true);
    const calls = store.commit.mock.calls as unknown as Array<[{ path: string }]>;
    const commitArg = calls[0]?.[0];
    if (!commitArg) throw new Error("expected store.commit to be called");
    expect(commitArg.path).toBe("community/archive/_staging/_removed/2026-04-26.md");
  });
});
