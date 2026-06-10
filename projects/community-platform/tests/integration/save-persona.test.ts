import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const authMock = vi.fn();
const writeFileMock = vi.fn(async () => ({ sha: "new" }));
const readFileMock = vi.fn(async () => null);

vi.mock("@/lib/auth", () => ({ auth: () => authMock() }));
vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: (h: string) => (h === "jane" ? { slug: "jane-d", githubHandle: "jane" } : null),
}));
vi.mock("@/lib/github-app", () => ({
  GitHubAppError: class extends Error { kind = "unknown"; },
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
vi.mock("@/lib/log", () => ({ log: { warn: vi.fn() } }));

import type * as PersonaFetchModule from "@/lib/persona-fetch";

const fetchPersonaMock = vi.fn();
vi.mock("@/lib/persona-fetch", async () => {
  const actual =
    await vi.importActual<typeof PersonaFetchModule>("@/lib/persona-fetch");
  // validatePersonaUrl stays REAL (the H151 guard is under test); only the
  // network fetch is mocked.
  return { ...actual, fetchPersonaFromUrl: (url: string) => fetchPersonaMock(url) };
});

import { savePersona } from "@/app/actions/save-persona";
import { mockPersonaStore } from "@/app/actions/_test-persona-store";
import { revalidatePath } from "next/cache";

function fd(content: string): FormData {
  const f = new FormData();
  f.append("content", content);
  return f;
}

function fdUrl(url: string): FormData {
  const f = new FormData();
  f.append("source_url", url);
  return f;
}
const SOURCE_URL = "https://raw.githubusercontent.com/jane/personas/main/persona-jane-d.public.md";
const PROFILE =
  "---\nname: Jane\ngithub_handle: jane\nconsented_at: 2026-01-01T00:00:00.000Z\n---\n\nProfile body.\n";
const VALID = "---\npersona_id: jane-d\ndisplay_name: Jane\nschema_version: 1.0\n---\n# Jane\n";

beforeEach(() => {
  authMock.mockReset();
  writeFileMock.mockClear();
  readFileMock.mockReset().mockResolvedValue(null);
  fetchPersonaMock.mockReset();
});

describe("savePersona", () => {
  it("rejects unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    expect(await savePersona(fd(VALID))).toEqual({ ok: false, error: "not_authenticated" });
  });

  it("H142: rejects persona_id ≠ slug", async () => {
    authMock.mockResolvedValue({ githubHandle: "jane" });
    expect(await savePersona(fd(VALID.replace("jane-d", "evil")))).toEqual({ ok: false, error: "id_mismatch" });
  });

  it("H140/H149: writes a single .public.md derived from the session slug", async () => {
    authMock.mockResolvedValue({ githubHandle: "jane" });
    const res = await savePersona(fd(VALID));
    expect(res.ok).toBe(true);
    expect(writeFileMock).toHaveBeenCalledTimes(1);
    const call = (writeFileMock.mock.calls as unknown as [string, ...unknown[]][]);
    expect(call[0]?.[0]).toBe(
      "persona-builder/personas/jane-d/persona-jane-d.public.md",
    );
  });
});

describe("E2E mock branch — isE2EMockActive() path", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_E2E_MODE", "1");
    // NODE_ENV is "test" by default in vitest — explicitly confirm it's not production.
    vi.stubEnv("NODE_ENV", "test");
    mockPersonaStore.reset();
    writeFileMock.mockClear();
    vi.mocked(revalidatePath).mockClear();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    mockPersonaStore.reset();
  });

  it("authenticated + valid persona → returns { ok: true }, writes to mockPersonaStore, skips real GitHub write, revalidates detail page", async () => {
    authMock.mockResolvedValue({ githubHandle: "jane" });

    const res = await savePersona(fd(VALID));

    expect(res.ok).toBe(true);
    // Mock store must have the written content.
    expect(mockPersonaStore.get("jane-d")).toBe(VALID);
    // Real GitHub writeFile must NOT have been called.
    expect(writeFileMock).not.toHaveBeenCalled();
    // Detail page revalidated; /members list is NOT revalidated (persona data absent there).
    expect(revalidatePath).toHaveBeenCalledWith("/members/jane-d");
    expect(revalidatePath).not.toHaveBeenCalledWith("/members");
  });

  it("source_url + E2E mode → H151 guard runs, FIXTURE written to mockPersonaStore, no fetch, no GitHub write", async () => {
    authMock.mockResolvedValue({ githubHandle: "jane" });
    const res = await savePersona(fdUrl(SOURCE_URL));
    expect(res.ok).toBe(true);
    expect(mockPersonaStore.get("jane-d")).toContain("persona_id: jane-d");
    expect(mockPersonaStore.get("jane-d")).toContain("e2e-url-attach");
    expect(fetchPersonaMock).not.toHaveBeenCalled();
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("source_url + E2E mode still rejects a non-allowlisted host (guard is never mocked)", async () => {
    authMock.mockResolvedValue({ githubHandle: "jane" });
    expect(await savePersona(fdUrl("https://raw.githubusercontent.com.evil.com/x"))).toEqual({
      ok: false,
      error: "invalid_url",
    });
    expect(mockPersonaStore.get("jane-d")).toBeNull();
  });
});

describe("savePersona — source_url branch (v0.12 H151/H154/O4)", () => {
  beforeEach(() => {
    authMock.mockResolvedValue({ githubHandle: "jane" });
    fetchPersonaMock.mockReset();
    (readFileMock as ReturnType<typeof vi.fn>).mockImplementation(async (path: string) =>
      path === "community/members/jane-d.md"
        ? { content: PROFILE, sha: "profsha", path }
        : null,
    );
  });

  it("rejects when BOTH content and source_url are present (mutually exclusive)", async () => {
    const f = fd(VALID);
    f.append("source_url", SOURCE_URL);
    expect(await savePersona(f)).toEqual({ ok: false, error: "invalid_content" });
    expect(fetchPersonaMock).not.toHaveBeenCalled();
  });

  it("H151: rejects a non-allowlisted host before any fetch", async () => {
    expect(await savePersona(fdUrl("https://evil.com/x"))).toEqual({
      ok: false,
      error: "invalid_url",
    });
    expect(fetchPersonaMock).not.toHaveBeenCalled();
  });

  it("happy path: fetch → H154 pipeline → persona commit THEN persona_source_url profile commit (order)", async () => {
    fetchPersonaMock.mockResolvedValue({ ok: true, content: VALID });
    const res = await savePersona(fdUrl(SOURCE_URL));
    expect(res.ok).toBe(true);

    const calls = writeFileMock.mock.calls as unknown as [string, string, unknown][];
    expect(calls).toHaveLength(2);
    expect(calls[0]?.[0]).toBe("persona-builder/personas/jane-d/persona-jane-d.public.md");
    expect(calls[0]?.[1]).toBe(VALID);
    expect(calls[1]?.[0]).toBe("community/members/jane-d.md");
    expect(calls[1]?.[1]).toContain("persona_source_url");
    expect(calls[1]?.[1]).toContain("raw.githubusercontent.com/jane/personas");
    // H19: other frontmatter keys survive the second commit.
    expect(calls[1]?.[1]).toContain("github_handle: jane");
  });

  it("propagates fetch_too_large from the fetch helper", async () => {
    fetchPersonaMock.mockResolvedValue({ ok: false, error: "fetch_too_large" });
    expect(await savePersona(fdUrl(SOURCE_URL))).toEqual({ ok: false, error: "fetch_too_large" });
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("H142/H154: fetched content with persona_id ≠ slug → id_mismatch, no write", async () => {
    fetchPersonaMock.mockResolvedValue({ ok: true, content: VALID.replace("jane-d", "evil") });
    expect(await savePersona(fdUrl(SOURCE_URL))).toEqual({ ok: false, error: "id_mismatch" });
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("failed profile write (second commit) returns write_failed", async () => {
    fetchPersonaMock.mockResolvedValue({ ok: true, content: VALID });
    writeFileMock
      .mockResolvedValueOnce({ sha: "new" })
      .mockRejectedValueOnce(new Error("boom"));
    expect(await savePersona(fdUrl(SOURCE_URL))).toEqual({ ok: false, error: "write_failed" });
  });

  it("missing profile file → write_failed (source pointer has nowhere to live)", async () => {
    fetchPersonaMock.mockResolvedValue({ ok: true, content: VALID });
    readFileMock.mockResolvedValue(null);
    expect(await savePersona(fdUrl(SOURCE_URL))).toEqual({ ok: false, error: "write_failed" });
  });
});
