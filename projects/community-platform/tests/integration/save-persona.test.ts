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

import { savePersona } from "@/app/actions/save-persona";
import { mockPersonaStore } from "@/app/actions/_test-persona-store";
import { revalidatePath } from "next/cache";

function fd(content: string): FormData {
  const f = new FormData();
  f.append("content", content);
  return f;
}
const VALID = "---\npersona_id: jane-d\ndisplay_name: Jane\nschema_version: 1.0\n---\n# Jane\n";

beforeEach(() => {
  authMock.mockReset();
  writeFileMock.mockClear();
  readFileMock.mockReset().mockResolvedValue(null);
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
});
