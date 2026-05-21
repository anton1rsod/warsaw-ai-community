import { describe, it, expect, vi, beforeEach } from "vitest";
import type * as ContentSnapshotModule from "@/lib/content-snapshot";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/content-snapshot", async (importOriginal) => {
  const actual = await importOriginal<typeof ContentSnapshotModule>();
  return {
    ...actual,
    isAdmin: vi.fn(),
    listEventsFromSnapshot: vi.fn(),
  };
});
vi.mock("@/lib/github-app", () => ({
  createGitHubApp: vi.fn(),
  GitHubAppError: class extends Error {
    kind: string;
    constructor(k: string) {
      super(k);
      this.kind = k;
    }
  },
}));
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
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/lib/auth";
import { isAdmin, listEventsFromSnapshot } from "@/lib/content-snapshot";
import { createGitHubApp } from "@/lib/github-app";
import { revalidatePath } from "next/cache";
import * as eventAuthor from "@/lib/event-author";
import { createEvent } from "@/app/actions/create-event";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
}

const writeFile = vi.fn();
const readFile = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createGitHubApp).mockReturnValue({
    readFile,
    writeFile,
    deleteFile: vi.fn(),
    commitMultipleFiles: vi.fn(),
    getHeadSha: vi.fn(),
  } as never);
  readFile.mockResolvedValue(null);
  writeFile.mockResolvedValue({ sha: "newsha" });
  vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
});

function signAsAdmin(handle = "anton1rsod"): void {
  vi.mocked(auth).mockResolvedValue({ githubHandle: handle } as never);
  vi.mocked(isAdmin).mockReturnValue(true);
}

describe("create-event — happy path", () => {
  it("commits a new event and returns { ok: true, slug }", async () => {
    signAsAdmin();

    const result = await createEvent(
      fd({
        title: "Meetup #5",
        date: "2026-05-28",
        body: "Hello.",
      }),
    );

    expect(result).toEqual({ ok: true, slug: "2026-05-28-meetup-5" });
    expect(writeFile).toHaveBeenCalledTimes(1);
    const firstCall = writeFile.mock.calls[0] as [
      string,
      string,
      { message: string },
    ];
    const [path, content, opts] = firstCall;
    expect(path).toBe("community/events/2026-05-28-meetup-5/README.md");
    expect(content).toContain('title: "Meetup #5"');
    expect(content).toContain('status: "scheduled"');
    expect((opts as { message: string }).message).toMatch(
      /chore\(events\): @anton1rsod create "2026-05-28-meetup-5"/,
    );
  });
});

describe("H69: RBAC oracle defense", () => {
  it("returns not_authorized when session is missing", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const r = await createEvent(
      fd({ title: "X", date: "2026-05-28", body: "" }),
    );
    expect(r).toEqual({ ok: false, error: "not_authorized" });
    expect(writeFile).not.toHaveBeenCalled();
  });

  it("returns not_authorized when session exists but isAdmin is false", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "non-admin" } as never);
    vi.mocked(isAdmin).mockReturnValue(false);
    const r = await createEvent(
      fd({ title: "X", date: "2026-05-28", body: "" }),
    );
    expect(r).toEqual({ ok: false, error: "not_authorized" });
    expect(writeFile).not.toHaveBeenCalled();
  });

  it("returns IDENTICAL error for both cases (oracle defense)", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const r1 = await createEvent(
      fd({ title: "X", date: "2026-05-28", body: "" }),
    );

    vi.clearAllMocks();
    vi.mocked(createGitHubApp).mockReturnValue({
      readFile,
      writeFile,
      deleteFile: vi.fn(),
      commitMultipleFiles: vi.fn(),
      getHeadSha: vi.fn(),
    } as never);
    vi.mocked(auth).mockResolvedValue({ githubHandle: "non-admin" } as never);
    vi.mocked(isAdmin).mockReturnValue(false);
    const r2 = await createEvent(
      fd({ title: "X", date: "2026-05-28", body: "" }),
    );

    expect(r1).toEqual(r2);
  });
});

describe("H71: slug shape rejection", () => {
  it("rejects an explicit slug that isn't kebab", async () => {
    signAsAdmin();
    const r = await createEvent(
      fd({ title: "X", date: "2026-05-28", slug: "Not_A_Slug", body: "" }),
    );
    expect(r).toEqual({ ok: false, error: "invalid_slug" });
    expect(writeFile).not.toHaveBeenCalled();
  });
});

describe("H74: path constructed server-side (rejects traversal slugs)", () => {
  it("rejects an explicit slug with ../", async () => {
    signAsAdmin();
    const r = await createEvent(
      fd({
        title: "X",
        date: "2026-05-28",
        slug: "2026-05-28-../../../etc/passwd",
        body: "",
      }),
    );
    expect(r).toEqual({ ok: false, error: "invalid_slug" });
    expect(writeFile).not.toHaveBeenCalled();
  });
});

describe("H77: invalid date", () => {
  it("rejects non-calendar date 2026-02-31", async () => {
    signAsAdmin();
    const r = await createEvent(
      fd({ title: "X", date: "2026-02-31", body: "" }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("invalid_slug");
    expect(writeFile).not.toHaveBeenCalled();
  });

  it("rejects malformed date string", async () => {
    signAsAdmin();
    const r = await createEvent(
      fd({ title: "X", date: "not-a-date", body: "" }),
    );
    expect(r).toEqual({ ok: false, error: "invalid_input" });
  });
});

describe("H70: slug collision via snapshot", () => {
  it("returns slug_exists without calling writeFile when snapshot contains slug", async () => {
    signAsAdmin();
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      { slug: "2026-05-28-meetup-5" } as unknown as ReturnType<
        typeof listEventsFromSnapshot
      >[number],
    ]);

    const r = await createEvent(
      fd({ title: "Meetup #5", date: "2026-05-28", body: "" }),
    );
    expect(r).toEqual({ ok: false, error: "slug_exists" });
    expect(writeFile).not.toHaveBeenCalled();
    expect(readFile).not.toHaveBeenCalled();
  });
});

describe("H78: GitHub-level pre-existence guard", () => {
  it("returns slug_exists when readFile finds existing file (snapshot stale)", async () => {
    signAsAdmin();
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    readFile.mockResolvedValue({
      content: "existing",
      sha: "abc",
      path: "x",
    });

    const r = await createEvent(
      fd({ title: "Race", date: "2026-05-28", body: "" }),
    );
    expect(r).toEqual({ ok: false, error: "slug_exists" });
    expect(writeFile).not.toHaveBeenCalled();
  });
});

describe("H72: round-trip parse safeguard", () => {
  it("returns invalid_input when composed README fails round-trip", async () => {
    signAsAdmin();
    const spy = vi
      .spyOn(eventAuthor, "composeEventReadme")
      .mockReturnValue("---\nnot:valid:yaml:structure\n---\n");

    const r = await createEvent(
      fd({ title: "Y", date: "2026-05-28", body: "" }),
    );
    expect(r).toEqual({ ok: false, error: "invalid_input" });
    expect(writeFile).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("H73: CRLF strip on session-derived handle", () => {
  it("commit message contains no CR/LF in handle position", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "evil\r\nuser",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);

    await createEvent(fd({ title: "Z", date: "2026-05-28", body: "" }));

    expect(writeFile).toHaveBeenCalledTimes(1);
    const [, , opts] = writeFile.mock.calls[0] as [
      string,
      string,
      { message: string },
    ];
    const msg = (opts as { message: string }).message;
    expect(msg).toContain("@eviluser create");
    expect(msg).not.toContain("evil\r\n");
    expect(msg).not.toContain("evil\nuser");
    expect(msg).toContain("Co-Authored-By: eviluser");
  });
});

describe("H75: status hardcoded server-side", () => {
  it("ignores any client-supplied status field; commits 'scheduled'", async () => {
    signAsAdmin();

    const data = fd({ title: "Z", date: "2026-05-28", body: "" });
    data.append("status", "cancelled");

    await createEvent(data);

    expect(writeFile).toHaveBeenCalledTimes(1);
    const [, content] = writeFile.mock.calls[0] as [
      string,
      string,
      { message: string },
    ];
    expect(content as string).toContain('status: "scheduled"');
    expect(content as string).not.toContain('status: "cancelled"');
  });
});

describe("H76: body size cap", () => {
  it("rejects body of 50_001 chars", async () => {
    signAsAdmin();
    const r = await createEvent(
      fd({ title: "Big", date: "2026-05-28", body: "x".repeat(50_001) }),
    );
    expect(r).toEqual({ ok: false, error: "invalid_input" });
    expect(writeFile).not.toHaveBeenCalled();
  });

  it("accepts body of exactly 50_000 chars", async () => {
    signAsAdmin();
    const r = await createEvent(
      fd({ title: "Big", date: "2026-05-28", body: "x".repeat(50_000) }),
    );
    expect(r.ok).toBe(true);
  });
});

describe("H79: revalidate fan-out", () => {
  it("revalidates /events, /events/<slug>, /home, /, /api/calendar.ics on success", async () => {
    signAsAdmin();

    await createEvent(fd({ title: "Z", date: "2026-05-28", body: "" }));

    expect(revalidatePath).toHaveBeenCalledWith("/events");
    expect(revalidatePath).toHaveBeenCalledWith("/events/2026-05-28-z");
    expect(revalidatePath).toHaveBeenCalledWith("/home");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/api/calendar.ics");
    expect(revalidatePath).toHaveBeenCalledTimes(5);
  });

  it("does NOT revalidate on failure", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    await createEvent(fd({ title: "Z", date: "2026-05-28", body: "" }));

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("create-event — writeFile failure", () => {
  it("returns internal_error when writeFile throws", async () => {
    signAsAdmin();
    writeFile.mockRejectedValue(new Error("network"));

    const r = await createEvent(
      fd({ title: "Z", date: "2026-05-28", body: "" }),
    );
    expect(r).toEqual({ ok: false, error: "internal_error" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
