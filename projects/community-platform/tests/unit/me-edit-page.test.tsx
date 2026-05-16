import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
}));

const mockClient = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  deleteFile: vi.fn(),
  commitMultipleFiles: vi.fn(),
  getHeadSha: vi.fn(),
};
vi.mock("@/lib/github-app", () => ({
  createGitHubApp: () => mockClient,
}));

vi.mock("@/lib/env", () => ({
  env: {
    GITHUB_APP_ID: "x",
    GITHUB_APP_PRIVATE_KEY: "x",
    GITHUB_APP_INSTALLATION_ID: "x",
    GITHUB_REPO_OWNER: "x",
    GITHUB_REPO_NAME: "x",
    GITHUB_REPO_BRANCH: "main",
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
}));

// Mock saveProfile (used by the rendered ProfileEditor) so the import chain
// resolves without hitting the real Octokit / auth at test time.
vi.mock("@/app/actions/save-profile", () => ({
  saveProfile: vi.fn(),
}));

interface CapturedEditorProps {
  initialBody: string;
  initialSha: string;
  slug: string;
  previewEndpoint: string;
}

const capturedProps: { current: CapturedEditorProps | null } = { current: null };
vi.mock("@/app/components/ProfileEditor", () => ({
  ProfileEditor: (props: CapturedEditorProps) => {
    capturedProps.current = props;
    return <div data-testid="profile-editor-mock">{props.initialBody}</div>;
  },
}));

import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { redirect } from "next/navigation";
import MeEditPage from "@/app/me/edit/page";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  capturedProps.current = null;
});
afterEach(cleanup);

describe("/me/edit page", () => {
  it("redirects to /login when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    await expect(MeEditPage()).rejects.toThrow(/__redirect__:\/login/);
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /no-access when the session handle is not on the roster", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "ghost" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue(undefined);
    await expect(MeEditPage()).rejects.toThrow(/__redirect__:\/no-access/);
    expect(redirect).toHaveBeenCalledWith("/no-access");
  });

  it("redirects to /consent when the profile file does not exist (D4)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue({
      slug: "anton-safronov",
      githubHandle: "anton1rsod",
      name: "Anton Safronov",
    } as never);
    mockClient.readFile.mockResolvedValue(null);
    await expect(MeEditPage()).rejects.toThrow(/__redirect__:\/consent/);
    expect(redirect).toHaveBeenCalledWith("/consent");
  });

  it("renders the ProfileEditor with the parsed body when the file exists", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue({
      slug: "anton-safronov",
      githubHandle: "anton1rsod",
      name: "Anton Safronov",
    } as never);
    mockClient.readFile.mockResolvedValue({
      content:
        "---\nname: Anton Safronov\ngithub_handle: anton1rsod\nconsented_at: 2026-05-03T13:59:19.410Z\n---\n\nHello world.\n",
      sha: "s1",
      path: "community/members/anton-safronov.md",
    });

    const tree = await MeEditPage();
    render(tree);

    expect(screen.getByRole("heading", { name: /Edit profile/i })).toBeInTheDocument();
    expect(screen.getByTestId("profile-editor-mock")).toBeInTheDocument();
    expect(capturedProps.current?.initialBody).toBe("Hello world.");
    expect(capturedProps.current?.slug).toBe("anton-safronov");
  });

  it("H16: passes file.sha to ProfileEditor as initialSha (optimistic-lock plumbing)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue({
      slug: "anton-safronov",
      githubHandle: "anton1rsod",
      name: "Anton Safronov",
    } as never);
    mockClient.readFile.mockResolvedValue({
      content:
        "---\nname: Anton Safronov\ngithub_handle: anton1rsod\nconsented_at: 2026-05-03T13:59:19.410Z\n---\n\nBody.\n",
      sha: "sha-from-github-readfile",
      path: "community/members/anton-safronov.md",
    });

    const tree = await MeEditPage();
    render(tree);

    expect(capturedProps.current?.initialSha).toBe("sha-from-github-readfile");
  });
});
