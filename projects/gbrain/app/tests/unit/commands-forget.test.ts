import { describe, it, expect, vi } from "vitest";
import { handleForget } from "../../src/commands/forget";

const fakeStore = {
  commit: vi.fn(async () => "sha1"),
  remove: vi.fn(async () => "sha2")
};

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
});
