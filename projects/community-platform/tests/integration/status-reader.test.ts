import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { readWeekStatuses } from "@/lib/status-reader";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const CONTENTS_BASE = "https://api.github.com/repos/owner/repo/contents";
const COMMITS_URL = "https://api.github.com/repos/owner/repo/commits";

const baseOpts = {
  owner: "owner",
  repo: "repo",
  branch: "main",
  token: "ghs_fake",
};

describe("status-reader", () => {
  it("lists week status files, parses bodies, sorts by lastModified desc", async () => {
    server.use(
      // Directory listing — Octokit URL-encodes the slashes in `path`.
      http.get(`${CONTENTS_BASE}/community%2Fstatus%2F2026-W18`, () =>
        HttpResponse.json([
          {
            type: "file",
            name: "anton-safronov.md",
            path: "community/status/2026-W18/anton-safronov.md",
            sha: "s1",
          },
          {
            type: "file",
            name: "alice-example.md",
            path: "community/status/2026-W18/alice-example.md",
            sha: "s2",
          },
          // Non-markdown file in the dir — must be ignored.
          {
            type: "file",
            name: ".gitkeep",
            path: "community/status/2026-W18/.gitkeep",
            sha: "s3",
          },
          // Sub-directory (shouldn't appear in v0.1 layout but defensively skip).
          {
            type: "dir",
            name: "draft",
            path: "community/status/2026-W18/draft",
            sha: "s4",
          },
        ]),
      ),
      http.get(
        `${CONTENTS_BASE}/community%2Fstatus%2F2026-W18%2Fanton-safronov.md`,
        () =>
          HttpResponse.json({
            type: "file",
            path: "community/status/2026-W18/anton-safronov.md",
            sha: "s1",
            content: Buffer.from(
              "Working on the platform plan.",
            ).toString("base64"),
            encoding: "base64",
          }),
      ),
      http.get(
        `${CONTENTS_BASE}/community%2Fstatus%2F2026-W18%2Falice-example.md`,
        () =>
          HttpResponse.json({
            type: "file",
            path: "community/status/2026-W18/alice-example.md",
            sha: "s2",
            content: Buffer.from("Reviewing PRs.").toString("base64"),
            encoding: "base64",
          }),
      ),
      http.get(COMMITS_URL, ({ request }) => {
        const url = new URL(request.url);
        const path = url.searchParams.get("path") ?? "";
        const ts = path.includes("anton")
          ? "2026-04-30T10:00:00Z"
          : "2026-04-29T10:00:00Z";
        return HttpResponse.json([{ commit: { committer: { date: ts } } }]);
      }),
    );

    const statuses = await readWeekStatuses({
      ...baseOpts,
      week: "2026-W18",
    });

    expect(statuses).toHaveLength(2);
    // Sorted by lastModified desc: anton (Apr 30) before alice (Apr 29).
    expect(statuses[0]?.slug).toBe("anton-safronov");
    expect(statuses[0]?.body).toBe("Working on the platform plan.");
    expect(statuses[0]?.sha).toBe("s1");
    expect(statuses[0]?.lastModified).toBe("2026-04-30T10:00:00Z");
    expect(statuses[1]?.slug).toBe("alice-example");
    expect(statuses[1]?.body).toBe("Reviewing PRs.");
  });

  it("returns empty array when directory does not exist (404)", async () => {
    server.use(
      http.get(`${CONTENTS_BASE}/community%2Fstatus%2F2026-W19`, () =>
        new HttpResponse(null, { status: 404 }),
      ),
    );
    const statuses = await readWeekStatuses({
      ...baseOpts,
      week: "2026-W19",
    });
    expect(statuses).toEqual([]);
  });

  it("returns empty array when path resolves to a file (defensive — config drift)", async () => {
    server.use(
      http.get(`${CONTENTS_BASE}/community%2Fstatus%2F2026-W18`, () =>
        HttpResponse.json({
          type: "file",
          path: "community/status/2026-W18",
          sha: "s",
          content: "",
          encoding: "base64",
        }),
      ),
    );
    const statuses = await readWeekStatuses({
      ...baseOpts,
      week: "2026-W18",
    });
    expect(statuses).toEqual([]);
  });

  it("falls back to current time when commits endpoint returns empty", async () => {
    server.use(
      http.get(`${CONTENTS_BASE}/community%2Fstatus%2F2026-W18`, () =>
        HttpResponse.json([
          {
            type: "file",
            name: "anton-safronov.md",
            path: "community/status/2026-W18/anton-safronov.md",
            sha: "s1",
          },
        ]),
      ),
      http.get(
        `${CONTENTS_BASE}/community%2Fstatus%2F2026-W18%2Fanton-safronov.md`,
        () =>
          HttpResponse.json({
            type: "file",
            path: "community/status/2026-W18/anton-safronov.md",
            sha: "s1",
            content: Buffer.from("hi").toString("base64"),
            encoding: "base64",
          }),
      ),
      http.get(COMMITS_URL, () => HttpResponse.json([])),
    );

    const before = new Date();
    const statuses = await readWeekStatuses({
      ...baseOpts,
      week: "2026-W18",
    });
    const after = new Date();
    expect(statuses).toHaveLength(1);
    const first = statuses[0];
    if (!first) throw new Error("expected one status");
    const ts = new Date(first.lastModified);
    expect(ts.getTime()).toBeGreaterThanOrEqual(before.getTime() - 100);
    expect(ts.getTime()).toBeLessThanOrEqual(after.getTime() + 100);
  });

  it("propagates non-404 directory listing errors", async () => {
    server.use(
      http.get(`${CONTENTS_BASE}/community%2Fstatus%2F2026-W18`, () =>
        new HttpResponse(JSON.stringify({ message: "forbidden" }), {
          status: 403,
        }),
      ),
    );
    await expect(
      readWeekStatuses({ ...baseOpts, week: "2026-W18" }),
    ).rejects.toThrow();
  });

  it("skips entries when individual file content fetch returns directory (race)", async () => {
    server.use(
      http.get(`${CONTENTS_BASE}/community%2Fstatus%2F2026-W18`, () =>
        HttpResponse.json([
          {
            type: "file",
            name: "anton-safronov.md",
            path: "community/status/2026-W18/anton-safronov.md",
            sha: "s1",
          },
        ]),
      ),
      // Race: file became a directory between listing and content fetch.
      http.get(
        `${CONTENTS_BASE}/community%2Fstatus%2F2026-W18%2Fanton-safronov.md`,
        () => HttpResponse.json([]),
      ),
      http.get(COMMITS_URL, () =>
        HttpResponse.json([
          { commit: { committer: { date: "2026-04-30T10:00:00Z" } } },
        ]),
      ),
    );

    const statuses = await readWeekStatuses({
      ...baseOpts,
      week: "2026-W18",
    });
    expect(statuses).toEqual([]);
  });

  it("rejects malformed week tokens before any GitHub API call", async () => {
    // Defense-in-depth guard: the WEEK_REGEX assertion runs before octokit
    // is invoked, so unhandled-request mode never fires.
    await expect(
      readWeekStatuses({ ...baseOpts, week: "../etc/passwd" }),
    ).rejects.toThrow(/invalid week token/);
    await expect(
      readWeekStatuses({ ...baseOpts, week: "" }),
    ).rejects.toThrow(/invalid week token/);
    await expect(
      readWeekStatuses({ ...baseOpts, week: "2026-W1" }),
    ).rejects.toThrow(/invalid week token/);
  });
});
