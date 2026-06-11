import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const writeFileMock = vi.fn(async () => ({ sha: "new" }));
const readFileMock = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: () => authMock() }));
vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: (h: string) =>
    h === "jane" ? { slug: "jane-d", githubHandle: "jane" } : null,
}));
vi.mock("@/lib/github-app", () => ({
  GitHubAppError: class extends Error {
    kind = "unknown";
  },
  createGitHubApp: () => ({ readFile: readFileMock, writeFile: writeFileMock }),
}));
vi.mock("@/lib/env", () => ({
  env: {
    GITHUB_APP_ID: "123",
    GITHUB_APP_PRIVATE_KEY: "test-pem",
    GITHUB_APP_INSTALLATION_ID: "456",
    GITHUB_REPO_OWNER: "test-owner",
    GITHUB_REPO_NAME: "test-repo",
    GITHUB_REPO_BRANCH: "main",
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/log", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { resyncPersona } from "@/app/actions/resync-persona";
import { revalidatePath } from "next/cache";

const GOOD_URL = "https://raw.githubusercontent.com/jane/personas/main/persona-jane-d.public.md";
const EVIL_URL = "https://169.254.169.254/latest/meta-data";
const VALID_PERSONA =
  "---\npersona_id: jane-d\ndisplay_name: Jane\nschema_version: 1.0\n---\n# Jane\n";
const MISMATCH_PERSONA =
  "---\npersona_id: someone-else\ndisplay_name: Jane\nschema_version: 1.0\n---\n# Jane\n";

function profileWith(url: string | null): { content: string; sha: string; path: string } {
  const sourceLine = url === null ? "" : `persona_source_url: ${url}\n`;
  return {
    content: `---\nname: Jane\ngithub_handle: jane\nconsented_at: 2026-01-01T00:00:00.000Z\n${sourceLine}---\n\nProfile body.\n`,
    sha: "profsha",
    path: "community/members/jane-d.md",
  };
}

const fetchSpy = vi.fn();

beforeEach(() => {
  authMock.mockReset().mockResolvedValue({ githubHandle: "jane" });
  writeFileMock.mockClear();
  readFileMock.mockReset();
  fetchSpy.mockReset();
  vi.stubGlobal("fetch", fetchSpy);
  vi.mocked(revalidatePath).mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("resyncPersona (v0.12 H153)", () => {
  it("rejects unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    expect(await resyncPersona()).toEqual({ ok: false, error: "not_authenticated" });
  });

  it("rejects non-members", async () => {
    authMock.mockResolvedValue({ githubHandle: "stranger" });
    expect(await resyncPersona()).toEqual({ ok: false, error: "not_a_member" });
  });

  it("invalid_url when the profile has no persona_source_url — no fetch", async () => {
    readFileMock.mockImplementation(async (p: string) =>
      p === "community/members/jane-d.md" ? profileWith(null) : null,
    );
    expect(await resyncPersona()).toEqual({ ok: false, error: "invalid_url" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("H153 TOCTOU: a stored URL edited to an internal host fails the re-run guard with NO fetch", async () => {
    readFileMock.mockImplementation(async (p: string) =>
      p === "community/members/jane-d.md" ? profileWith(EVIL_URL) : null,
    );
    expect(await resyncPersona()).toEqual({ ok: false, error: "invalid_url" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("happy path: fresh profile read → guard → fetch → H142 → slug-derived write → revalidate", async () => {
    readFileMock.mockImplementation(async (p: string) =>
      p === "community/members/jane-d.md" ? profileWith(GOOD_URL) : null,
    );
    fetchSpy.mockResolvedValue(new Response(VALID_PERSONA, { status: 200 }));

    const res = await resyncPersona();
    expect(res.ok).toBe(true);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calls = writeFileMock.mock.calls as unknown as [string, string, unknown][];
    expect(calls).toHaveLength(1);
    // H140 parity: write path derived from the SESSION slug only.
    expect(calls[0]?.[0]).toBe("persona-builder/personas/jane-d/persona-jane-d.public.md");
    expect(calls[0]?.[1]).toBe(VALID_PERSONA);
    expect(revalidatePath).toHaveBeenCalledWith("/members/jane-d");
  });

  it("H142 re-applied to the fetched body: persona_id mismatch → id_mismatch, no write", async () => {
    readFileMock.mockImplementation(async (p: string) =>
      p === "community/members/jane-d.md" ? profileWith(GOOD_URL) : null,
    );
    fetchSpy.mockResolvedValue(new Response(MISMATCH_PERSONA, { status: 200 }));

    expect(await resyncPersona()).toEqual({ ok: false, error: "id_mismatch" });
    expect(writeFileMock).not.toHaveBeenCalled();
  });
});
