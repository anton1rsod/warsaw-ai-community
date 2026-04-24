import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockGet = vi.fn();
const mockDelete = vi.fn();

vi.mock("octokit", () => ({
  Octokit: class {
    rest = {
      repos: {
        createOrUpdateFileContents: mockCreate,
        getContent: mockGet,
        deleteFile: mockDelete
      }
    };
  }
}));

beforeEach(() => { mockCreate.mockReset(); mockGet.mockReset(); mockDelete.mockReset(); });

describe("store.commit", () => {
  it("rejects paths outside community/archive/", async () => {
    const { createGithubStore } = await import("../../src/store/github");
    const store = createGithubStore({ token: "x", owner: "o", repo: "r", branch: "main" });
    await expect(store.commit({ path: "community/charter/hack.md", content: "x", message: "m" }))
      .rejects.toThrow(/community\/archive/);
  });

  it("calls Octokit createOrUpdateFileContents with the right args", async () => {
    mockGet.mockRejectedValueOnce({ status: 404 });
    mockCreate.mockResolvedValueOnce({ data: { commit: { sha: "abc123" } } });
    const { createGithubStore } = await import("../../src/store/github");
    const store = createGithubStore({ token: "x", owner: "o", repo: "r", branch: "main" });
    const sha = await store.commit({
      path: "community/archive/2026-04/foo.md",
      content: "hello",
      message: "archive: Questions & Answers — alice — 2026-04-24"
    });
    expect(sha).toBe("abc123");
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const call = mockCreate.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call!.owner).toBe("o");
    expect(call!.repo).toBe("r");
    expect(call!.path).toBe("community/archive/2026-04/foo.md");
    expect(call!.branch).toBe("main");
    expect(call!.message).toMatch(/archive:/);
    expect(call!.committer.name).toBe("gbrain-bot");
  });

  it("passes existing SHA when updating a file", async () => {
    mockGet.mockResolvedValueOnce({ data: { sha: "oldSha", type: "file" } });
    mockCreate.mockResolvedValueOnce({ data: { commit: { sha: "newCommit" } } });
    const { createGithubStore } = await import("../../src/store/github");
    const store = createGithubStore({ token: "x", owner: "o", repo: "r", branch: "main" });
    await store.commit({ path: "community/archive/2026-04/foo.md", content: "hi", message: "m" });
    const call = mockCreate.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call!.sha).toBe("oldSha");
  });
});
