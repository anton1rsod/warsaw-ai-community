import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ParsedMessage } from "../../src/types";
import type { GithubStore } from "../../src/store/index";

function makeMsg(overrides: Partial<ParsedMessage> = {}): ParsedMessage {
  return {
    raw: {
      message_id: 100,
      date: 1714032000,
      chat: { id: -1001234567890, type: "supergroup" },
      message_thread_id: 6,
      from: { id: 500, username: "alice", first_name: "Alice" },
      text: "DeepSeek V4 Pro launched"
    },
    tags: new Set(),
    topicId: 6,
    topicClass: "formal",
    authorHandle: "alice",
    plainText: "DeepSeek V4 Pro launched",
    timestamp: new Date("2026-04-24T08:00:00Z"),
    ...overrides
  };
}

interface MockGithubStore extends GithubStore {
  _commit: ReturnType<typeof vi.fn>;
  _readJson: ReturnType<typeof vi.fn>;
  _listDir: ReturnType<typeof vi.fn>;
}

function makeStore(): MockGithubStore {
  const _commit = vi.fn().mockResolvedValue("sha-abc");
  const _readJson = vi.fn().mockResolvedValue(null);
  const _listDir = vi.fn().mockResolvedValue([]);
  return {
    commit: _commit,
    remove: vi.fn().mockResolvedValue("sha-del"),
    readJson: _readJson,
    listDir: _listDir,
    _commit,
    _readJson,
    _listDir
  };
}

beforeEach(() => vi.clearAllMocks());

describe("createNewsLogStore.record", () => {
  it("commits a JSON file under <basePath>/<YYYY-MM-DD>/", async () => {
    const { createNewsLogStore } = await import("../../src/digest/news-log");
    const store = makeStore();
    const log = createNewsLogStore({ github: store, namespace: "" });

    await log.record(makeMsg());

    expect(store._commit).toHaveBeenCalledTimes(1);
    const call = store._commit.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call!.path).toMatch(/^community\/archive\/_news-log\/2026-04-24\/.+\.json$/);
  });

  it("namespaces the path when namespace is set", async () => {
    const { createNewsLogStore } = await import("../../src/digest/news-log");
    const store = makeStore();
    const log = createNewsLogStore({ github: store, namespace: "_staging" });

    await log.record(makeMsg());

    const call = store._commit.mock.calls[0]?.[0];
    expect(call!.path).toMatch(/^community\/archive\/_staging\/_news-log\/2026-04-24\//);
  });

  it("includes the message_id in the filename for sortability", async () => {
    const { createNewsLogStore } = await import("../../src/digest/news-log");
    const store = makeStore();
    const log = createNewsLogStore({ github: store, namespace: "" });
    const msg = makeMsg();
    msg.raw.message_id = 42;

    await log.record(msg);

    const call = store._commit.mock.calls[0]?.[0];
    expect(call!.path).toMatch(/-42\.json$/);
  });

  it("serializes Set tags to array and Date timestamp to ISO string", async () => {
    const { createNewsLogStore } = await import("../../src/digest/news-log");
    const store = makeStore();
    const log = createNewsLogStore({ github: store, namespace: "" });
    const msg = makeMsg({ tags: new Set(["kb", "important"]) });

    await log.record(msg);

    const call = store._commit.mock.calls[0]?.[0];
    const parsed = JSON.parse(call!.content);
    expect(parsed.tags).toEqual(["kb", "important"]);
    expect(parsed.timestamp).toBe("2026-04-24T08:00:00.000Z");
  });
});

describe("createNewsLogStore.snapshot", () => {
  it("returns empty array when no files in range", async () => {
    const { createNewsLogStore } = await import("../../src/digest/news-log");
    const store = makeStore();
    const log = createNewsLogStore({ github: store, namespace: "" });

    const result = await log.snapshot({
      since: new Date("2026-04-23T00:00:00Z"),
      until: new Date("2026-04-24T00:00:00Z")
    });

    expect(result).toEqual([]);
  });

  it("reads each day in range, parses JSON entries, restores Set + Date types", async () => {
    const { createNewsLogStore } = await import("../../src/digest/news-log");
    const store = makeStore();
    const msg = makeMsg();
    store._listDir.mockImplementation(async (path: string) => {
      if (path === "community/archive/_news-log/2026-04-24") {
        return [
          {
            name: "test.json",
            path: `${path}/test.json`,
            type: "file",
            sha: "1"
          }
        ];
      }
      return [];
    });
    store._readJson.mockResolvedValue({
      raw: msg.raw,
      tags: ["kb"],
      topicId: 6,
      topicClass: "formal",
      authorHandle: "alice",
      plainText: msg.plainText,
      timestamp: msg.timestamp.toISOString()
    });

    const log = createNewsLogStore({ github: store, namespace: "" });
    const result = await log.snapshot({
      since: new Date("2026-04-24T00:00:00Z"),
      until: new Date("2026-04-24T23:59:59Z")
    });

    expect(result).toHaveLength(1);
    expect(result[0]!.authorHandle).toBe("alice");
    expect(result[0]!.timestamp).toEqual(msg.timestamp);
    expect(result[0]!.tags).toBeInstanceOf(Set);
    expect(result[0]!.tags.has("kb")).toBe(true);
  });

  it("ignores non-JSON entries", async () => {
    const { createNewsLogStore } = await import("../../src/digest/news-log");
    const store = makeStore();
    store._listDir.mockResolvedValue([
      {
        name: "README.md",
        path: "community/archive/_news-log/2026-04-24/README.md",
        type: "file",
        sha: "1"
      },
      {
        name: "subdir",
        path: "community/archive/_news-log/2026-04-24/subdir",
        type: "dir",
        sha: "2"
      }
    ]);
    const log = createNewsLogStore({ github: store, namespace: "" });

    const result = await log.snapshot({
      since: new Date("2026-04-24T00:00:00Z"),
      until: new Date("2026-04-24T23:59:59Z")
    });

    expect(result).toEqual([]);
    expect(store._readJson).not.toHaveBeenCalled();
  });

  it("walks multiple days in the range", async () => {
    const { createNewsLogStore } = await import("../../src/digest/news-log");
    const store = makeStore();
    store._listDir.mockResolvedValue([]);

    const log = createNewsLogStore({ github: store, namespace: "" });
    await log.snapshot({
      since: new Date("2026-04-22T00:00:00Z"),
      until: new Date("2026-04-24T00:00:00Z")
    });

    expect(store._listDir).toHaveBeenCalledWith(
      "community/archive/_news-log/2026-04-22"
    );
    expect(store._listDir).toHaveBeenCalledWith(
      "community/archive/_news-log/2026-04-23"
    );
    expect(store._listDir).toHaveBeenCalledWith(
      "community/archive/_news-log/2026-04-24"
    );
  });
});
