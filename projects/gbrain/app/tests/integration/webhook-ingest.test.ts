import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BotClient } from "../../src/telegram/client";
import type { GithubStore } from "../../src/store/index";
import type { PipelineDeps } from "../../src/pipeline";
import { createInMemoryPreferences } from "../../src/consent/preferences";
import { createInMemoryPendingStore } from "../../src/pending/index";
import { ingestOne } from "../../src/pipeline";
import {
  MSG_NEWS_RAW,
  MSG_QA_WITHOUT_TAG,
  MSG_QA_WITH_KB
} from "../fixtures/telegram-messages";
import type { Config } from "../../src/config";

const TEST_CFG: Config = {
  telegram: { token: "tok", webhookSecret: "sec", chatId: -1001234567890 },
  ai: { gatewayKey: undefined, geminiKey: "gw" },
  github: { token: "gh", owner: "o", repo: "r", branch: "main" },
  topics: {
    generalId: 1,
    qaId: 2,
    guidesId: 3,
    meetupsId: 4,
    projectsId: 5,
    newsSignalsId: 6,
    toolsId: 7,
    pitchesId: 8
  },
  digest: { timezone: "Europe/Warsaw", hourLocal: 9 },
  flags: { killSwitch: false, digestEnabled: true },
  cron: { secret: "cron-sec" },
  archive: { namespace: "" }
};

function makeBot(): BotClient & {
  _sendDM: ReturnType<typeof vi.fn>;
  _setReaction: ReturnType<typeof vi.fn>;
} {
  const _sendDM = vi.fn().mockResolvedValue(undefined);
  const _setReaction = vi.fn().mockResolvedValue(undefined);
  return {
    sendMessage: vi.fn().mockResolvedValue(undefined),
    sendDirectMessage: _sendDM,
    setReaction: _setReaction,
    _sendDM,
    _setReaction
  };
}

function makeStore(): GithubStore & { _commit: ReturnType<typeof vi.fn> } {
  const _commit = vi.fn().mockResolvedValue("sha-abc");
  return {
    commit: _commit,
    remove: vi.fn().mockResolvedValue("sha-del"),
    readJson: vi.fn().mockResolvedValue(null),
    listDir: vi.fn().mockResolvedValue([]),
    _commit
  };
}

function makeNewsLog(): {
  record: ReturnType<typeof vi.fn>;
  snapshot: ReturnType<typeof vi.fn>;
} {
  return {
    record: vi.fn().mockResolvedValue(undefined),
    snapshot: vi.fn().mockResolvedValue([])
  };
}

function makeDeps(overrides: Partial<PipelineDeps> = {}): PipelineDeps & {
  _bot: ReturnType<typeof makeBot>;
  _store: ReturnType<typeof makeStore>;
  _newsLog: ReturnType<typeof makeNewsLog>;
} {
  const _bot = makeBot();
  const _store = makeStore();
  const _newsLog = makeNewsLog();
  const deps: PipelineDeps & {
    _bot: ReturnType<typeof makeBot>;
    _store: ReturnType<typeof makeStore>;
    _newsLog: ReturnType<typeof makeNewsLog>;
  } = {
    cfg: TEST_CFG,
    bot: _bot,
    store: _store,
    prefs: createInMemoryPreferences(),
    pending: createInMemoryPendingStore(),
    newsLog: _newsLog,
    now: () => new Date("2026-04-24T12:00:00Z"),
    _bot,
    _store,
    _newsLog,
    ...overrides
  };
  return deps;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ingestOne integration", () => {
  it("formal topic + #kb: commits immediately and sets 👀 reaction", async () => {
    // MSG_NEWS_RAW: thread_id=6 → newsSignalsId (formal), no #kb tag in text
    // We need a formal + #kb message — add #kb to the news message text
    const msg = { ...MSG_NEWS_RAW, text: MSG_NEWS_RAW.text + " #kb" };
    const deps = makeDeps();

    const outcome = await ingestOne(msg, deps);

    expect(outcome.handled).toBe("allow-committed");
    expect(deps._store._commit).toHaveBeenCalledTimes(1);
    const call = deps._store._commit.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call!.path).toMatch(/^community\/archive\/2026-04\//);
    expect(call!.message).toMatch(/archive:/);
    expect(call!.content).toContain("topic: News & Signals");
    expect(deps._bot._setReaction).toHaveBeenCalledWith(
      TEST_CFG.telegram.chatId,
      msg.message_id,
      "👀"
    );
  });

  it("formal topic + no tag: defers and sets 🤔 reaction", async () => {
    // MSG_NEWS_RAW: thread_id=6 → newsSignalsId (formal), no #kb → defer_48h
    const deps = makeDeps();

    const outcome = await ingestOne(MSG_NEWS_RAW, deps);

    expect(outcome.handled).toBe("deferred");
    expect(deps._store._commit).not.toHaveBeenCalled();
    expect(deps._bot._setReaction).toHaveBeenCalledWith(
      TEST_CFG.telegram.chatId,
      MSG_NEWS_RAW.message_id,
      "🤔"
    );
    expect(deps.pending.all()).toHaveLength(1);
  });

  it("casual topic + no tag: denies without committing or reacting", async () => {
    // MSG_QA_WITHOUT_TAG: thread_id=2 → qaId (casual), no #kb → deny
    const deps = makeDeps();

    const outcome = await ingestOne(MSG_QA_WITHOUT_TAG, deps);

    expect(outcome.handled).toBe("denied");
    expect(deps._store._commit).not.toHaveBeenCalled();
    expect(deps._bot._setReaction).not.toHaveBeenCalled();
    expect(deps._bot._sendDM).not.toHaveBeenCalled();
  });

  it("casual topic + #kb (taggerIsAuthor=true): commits immediately", async () => {
    // MSG_QA_WITH_KB: thread_id=2 → qaId (casual), has #kb → allow (taggerIsAuthor hardcoded true)
    const deps = makeDeps();

    const outcome = await ingestOne(MSG_QA_WITH_KB, deps);

    expect(outcome.handled).toBe("allow-committed");
    expect(deps._store._commit).toHaveBeenCalledTimes(1);
    const call = deps._store._commit.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call!.path).toMatch(/^community\/archive\/2026-04\//);
    expect(deps._bot._setReaction).toHaveBeenCalledWith(
      TEST_CFG.telegram.chatId,
      MSG_QA_WITH_KB.message_id,
      "👀"
    );
  });

  it("inserts ARCHIVE_NAMESPACE into the archive path when configured", async () => {
    const cfg: Config = { ...TEST_CFG, archive: { namespace: "_staging" } };
    const deps = makeDeps({ cfg });
    const msg = { ...MSG_NEWS_RAW, text: MSG_NEWS_RAW.text + " #kb" };

    const outcome = await ingestOne(msg, deps);

    expect(outcome.handled).toBe("allow-committed");
    const call = deps._store._commit.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call!.path).toMatch(/^community\/archive\/_staging\/2026-04\//);
  });

  it("namespace also applies to deferred archive paths", async () => {
    const cfg: Config = { ...TEST_CFG, archive: { namespace: "_staging" } };
    const deps = makeDeps({ cfg });

    await ingestOne(MSG_NEWS_RAW, deps);

    const queued = deps.pending.all();
    expect(queued).toHaveLength(1);
    expect(queued[0]!.messagePath).toMatch(/^community\/archive\/_staging\/2026-04\//);
  });
});
