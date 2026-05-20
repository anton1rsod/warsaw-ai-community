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

describe("create-event — happy path", () => {
  it("commits a new event and returns { ok: true, slug }", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(isAdmin).mockReturnValue(true);

    const result = await createEvent(
      fd({
        title: "Meetup #5",
        date: "2026-05-28",
        body: "Hello.",
      }),
    );

    expect(result).toEqual({ ok: true, slug: "2026-05-28-meetup-5" });
    expect(writeFile).toHaveBeenCalledTimes(1);
    const [path, content, opts] = writeFile.mock.calls[0];
    expect(path).toBe("community/events/2026-05-28-meetup-5/README.md");
    expect(content).toContain('title: "Meetup #5"');
    expect(content).toContain('status: "scheduled"');
    expect((opts as { message: string }).message).toMatch(
      /chore\(events\): @anton1rsod create "2026-05-28-meetup-5"/,
    );
  });
});
