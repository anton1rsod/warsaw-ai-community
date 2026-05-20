import { describe, it, expect, vi, beforeEach } from "vitest";
import type * as GitHubAppModule from "@/lib/github-app";

const mockAuth = vi.fn();
const mockReadFile = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));
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
vi.mock("@/lib/github-app", async () => {
  const actual = await vi.importActual<typeof GitHubAppModule>("@/lib/github-app");
  return {
    ...actual,
    createGitHubApp: () => ({
      readFile: mockReadFile,
    }),
  };
});
vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: (h: string) =>
    h === "anton1rsod" ? { slug: "anton-safronov", name: "Anton" } : undefined,
  listEventsFromSnapshot: () => [
    {
      date: "2026-05-21",
      slug: "2026-05-21-meetup-4",
      title: "Meetup #4",
      body: "",
      status: "scheduled",
    },
  ],
}));

import { GET } from "@/app/api/event-rsvp-state/route";

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ githubHandle: "anton1rsod" });
});

function buildReq(slug: string): Request {
  return new Request(
    `https://example.com/api/event-rsvp-state?slug=${encodeURIComponent(slug)}`,
  );
}

describe("v0.4.7: GET /api/event-rsvp-state — auth gates", () => {
  it("no session → 401 not_authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(buildReq("2026-05-21-meetup-4"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("not_authenticated");
  });

  it("session but not a roster member → 403 not_a_member", async () => {
    mockAuth.mockResolvedValue({ githubHandle: "stranger" });
    const res = await GET(buildReq("2026-05-21-meetup-4"));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("not_a_member");
  });
});

describe("v0.4.7: GET /api/event-rsvp-state — slug validation", () => {
  it("missing slug query → 400 invalid_slug", async () => {
    const res = await GET(new Request("https://example.com/api/event-rsvp-state"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_slug");
  });

  it("malformed slug → 400 invalid_slug", async () => {
    const res = await GET(buildReq("not-a-slug"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_slug");
  });

  it("unknown event slug → 404 event_not_found", async () => {
    const res = await GET(buildReq("2026-99-99-nope"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_slug");
  });

  it("calendar-valid but not in snapshot → 404 event_not_found", async () => {
    const res = await GET(buildReq("2026-12-31-mystery"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("event_not_found");
  });
});

describe("v0.4.7: GET /api/event-rsvp-state — state derivation", () => {
  it("slug in events_going → 200 { state: 'going', profileSha }", async () => {
    mockReadFile.mockResolvedValue({
      content:
        "---\nname: Anton\nevents_going:\n  - 2026-05-21-meetup-4\n---\nbody\n",
      sha: "sha-abc",
      path: "community/members/anton-safronov.md",
    });
    const res = await GET(buildReq("2026-05-21-meetup-4"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.state).toBe("going");
    expect(body.profileSha).toBe("sha-abc");
  });

  it("slug in events_interested → 200 { state: 'interested', profileSha }", async () => {
    mockReadFile.mockResolvedValue({
      content:
        "---\nname: Anton\nevents_interested:\n  - 2026-05-21-meetup-4\n---\nbody\n",
      sha: "sha-def",
      path: "x",
    });
    const res = await GET(buildReq("2026-05-21-meetup-4"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.state).toBe("interested");
    expect(body.profileSha).toBe("sha-def");
  });

  it("slug in neither array → 200 { state: 'none', profileSha }", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\n---\nbody\n",
      sha: "sha-ghi",
      path: "x",
    });
    const res = await GET(buildReq("2026-05-21-meetup-4"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.state).toBe("none");
    expect(body.profileSha).toBe("sha-ghi");
  });
});

describe("v0.4.7: GET /api/event-rsvp-state — error paths", () => {
  it("readFile returns null → 500 internal_error", async () => {
    mockReadFile.mockResolvedValue(null);
    const res = await GET(buildReq("2026-05-21-meetup-4"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("internal_error");
  });

  it("never edge-cached — Cache-Control: private, no-store", async () => {
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\n---\nbody\n",
      sha: "sha-jkl",
      path: "x",
    });
    const res = await GET(buildReq("2026-05-21-meetup-4"));
    expect(res.headers.get("cache-control")).toMatch(/private/);
    expect(res.headers.get("cache-control")).toMatch(/no-store/);
  });
});
