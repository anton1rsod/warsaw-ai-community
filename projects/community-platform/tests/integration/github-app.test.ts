import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createGitHubApp } from "@/lib/github-app";

const TEST_KEY = fs.readFileSync(
  fileURLToPath(new URL("../fixtures/test-app.private-key.pem", import.meta.url)),
  "utf8",
);

const config = {
  appId: "12345",
  privateKey: TEST_KEY,
  installationId: "67890",
  owner: "warsaw-ai-community",
  repo: "warsaw-ai-community",
  branch: "main",
};

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const TOKEN_URL =
  "https://api.github.com/app/installations/67890/access_tokens";
const CONTENTS_BASE =
  "https://api.github.com/repos/warsaw-ai-community/warsaw-ai-community/contents";

function tokenHandler(): ReturnType<typeof http.post> {
  return http.post(TOKEN_URL, () =>
    HttpResponse.json({
      token: "ghs_fake",
      expires_at: "2099-01-01T00:00:00Z",
      permissions: { contents: "write" },
    }),
  );
}

describe("github-app", () => {
  it("readFile returns content + sha when file exists", async () => {
    server.use(
      tokenHandler(),
      // Octokit percent-encodes `/` in the {path} parameter
      // (verified empirically; getContent uses simple-style template).
      http.get(
        `${CONTENTS_BASE}/community%2Fstatus%2F2026-W18%2Fanton.md`,
        () =>
          HttpResponse.json({
            type: "file",
            path: "community/status/2026-W18/anton.md",
            sha: "abc123",
            content: Buffer.from("Hello").toString("base64"),
            encoding: "base64",
          }),
      ),
    );

    const app = createGitHubApp(config);
    const result = await app.readFile("community/status/2026-W18/anton.md");
    expect(result?.content).toBe("Hello");
    expect(result?.sha).toBe("abc123");
    expect(result?.path).toBe("community/status/2026-W18/anton.md");
  });

  it("readFile returns null when path resolves to a directory", async () => {
    server.use(
      tokenHandler(),
      http.get(`${CONTENTS_BASE}/some%2Fdir`, () =>
        HttpResponse.json([
          { type: "file", name: "a.md", path: "some/dir/a.md", sha: "s1" },
        ]),
      ),
    );
    const app = createGitHubApp(config);
    expect(await app.readFile("some/dir")).toBeNull();
  });

  it("readFile throws unknown when path is a non-file content type (symlink/submodule)", async () => {
    server.use(
      tokenHandler(),
      http.get(`${CONTENTS_BASE}/link.md`, () =>
        HttpResponse.json({
          type: "symlink",
          path: "link.md",
          sha: "s1",
          target: "elsewhere.md",
        }),
      ),
    );
    const app = createGitHubApp(config);
    await expect(app.readFile("link.md")).rejects.toMatchObject({
      kind: "unknown",
      message: expect.stringContaining("symlink"),
    });
  });

  it("readFile throws unknown when encoding is not base64 (>1MB file)", async () => {
    server.use(
      tokenHandler(),
      http.get(`${CONTENTS_BASE}/large.md`, () =>
        HttpResponse.json({
          type: "file",
          path: "large.md",
          sha: "abc",
          content: "",
          encoding: "none",
        }),
      ),
    );
    const app = createGitHubApp(config);
    await expect(app.readFile("large.md")).rejects.toMatchObject({
      kind: "unknown",
      message: expect.stringContaining("unsupported encoding"),
    });
  });

  it("readFile returns null on 404", async () => {
    server.use(
      tokenHandler(),
      http.get(`${CONTENTS_BASE}/missing.md`, () =>
        new HttpResponse(null, { status: 404 }),
      ),
    );
    const app = createGitHubApp(config);
    expect(await app.readFile("missing.md")).toBeNull();
  });

  it("readFile maps non-404 HTTP error via mapError", async () => {
    server.use(
      tokenHandler(),
      http.get(`${CONTENTS_BASE}/forbidden.md`, () =>
        new HttpResponse(JSON.stringify({ message: "forbidden" }), {
          status: 403,
        }),
      ),
    );
    const app = createGitHubApp(config);
    await expect(app.readFile("forbidden.md")).rejects.toMatchObject({
      kind: "forbidden",
    });
  });

  it("writeFile creates file when no SHA provided", async () => {
    let putBody: Record<string, unknown> | null = null;
    server.use(
      tokenHandler(),
      http.put(`${CONTENTS_BASE}/x.md`, async ({ request }) => {
        putBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ content: { sha: "newsha" } });
      }),
    );

    const app = createGitHubApp(config);
    const result = await app.writeFile("x.md", "Hi", { message: "test" });
    expect(result.sha).toBe("newsha");
    expect(putBody).toEqual(
      expect.objectContaining({
        message: "test",
        content: Buffer.from("Hi").toString("base64"),
        branch: "main",
      }),
    );
    expect(putBody).not.toHaveProperty("sha");
  });

  it("writeFile passes SHA when provided (update path)", async () => {
    let putBody: Record<string, unknown> | null = null;
    server.use(
      tokenHandler(),
      http.put(`${CONTENTS_BASE}/x.md`, async ({ request }) => {
        putBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ content: { sha: "newsha" } });
      }),
    );

    const app = createGitHubApp(config);
    await app.writeFile("x.md", "Hi", { message: "edit", sha: "oldsha" });
    expect(putBody).toEqual(expect.objectContaining({ sha: "oldsha" }));
  });

  it("writeFile maps 409 to GitHubAppError(sha_conflict)", async () => {
    server.use(
      tokenHandler(),
      http.put(`${CONTENTS_BASE}/x.md`, () =>
        new HttpResponse(JSON.stringify({ message: "conflict" }), {
          status: 409,
        }),
      ),
    );

    const app = createGitHubApp(config);
    await expect(
      app.writeFile("x.md", "Hi", { message: "test", sha: "stale" }),
    ).rejects.toMatchObject({ kind: "sha_conflict" });
  });

  it("writeFile maps 403 to GitHubAppError(forbidden)", async () => {
    server.use(
      tokenHandler(),
      http.put(`${CONTENTS_BASE}/x.md`, () =>
        new HttpResponse(JSON.stringify({ message: "forbidden" }), {
          status: 403,
        }),
      ),
    );
    const app = createGitHubApp(config);
    await expect(
      app.writeFile("x.md", "Hi", { message: "test" }),
    ).rejects.toMatchObject({ kind: "forbidden" });
  });

  it("writeFile maps unknown HTTP error to GitHubAppError(unknown)", async () => {
    server.use(
      tokenHandler(),
      http.put(`${CONTENTS_BASE}/x.md`, () =>
        new HttpResponse(JSON.stringify({ message: "boom" }), { status: 500 }),
      ),
    );
    const app = createGitHubApp(config);
    await expect(
      app.writeFile("x.md", "Hi", { message: "test" }),
    ).rejects.toMatchObject({ kind: "unknown" });
  });

  it("writeFile throws GitHubAppError(unknown) when API response lacks content.sha", async () => {
    server.use(
      tokenHandler(),
      // Empty content object → sha missing. The error is thrown inside the
      // try block, caught, and re-thrown by the `instanceof GitHubAppError`
      // branch (this also covers that re-throw).
      http.put(`${CONTENTS_BASE}/x.md`, () =>
        HttpResponse.json({ content: {} }),
      ),
    );
    const app = createGitHubApp(config);
    await expect(
      app.writeFile("x.md", "Hi", { message: "test" }),
    ).rejects.toMatchObject({
      kind: "unknown",
      message: expect.stringContaining("missing content.sha"),
    });
  });

  it("deleteFile passes SHA in request body", async () => {
    let deleteBody: Record<string, unknown> | null = null;
    server.use(
      tokenHandler(),
      http.delete(`${CONTENTS_BASE}/x.md`, async ({ request }) => {
        deleteBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({});
      }),
    );

    const app = createGitHubApp(config);
    await app.deleteFile("x.md", { sha: "abc", message: "delete" });
    expect(deleteBody).toEqual(
      expect.objectContaining({
        sha: "abc",
        message: "delete",
        branch: "main",
      }),
    );
  });

  it("deleteFile maps 404 to GitHubAppError(not_found)", async () => {
    server.use(
      tokenHandler(),
      http.delete(`${CONTENTS_BASE}/missing.md`, () =>
        new HttpResponse(null, { status: 404 }),
      ),
    );
    const app = createGitHubApp(config);
    await expect(
      app.deleteFile("missing.md", { sha: "abc", message: "delete" }),
    ).rejects.toMatchObject({ kind: "not_found" });
  });

  it("deleteFile maps 403 to GitHubAppError(forbidden)", async () => {
    server.use(
      tokenHandler(),
      http.delete(`${CONTENTS_BASE}/x.md`, () =>
        new HttpResponse(JSON.stringify({ message: "forbidden" }), {
          status: 403,
        }),
      ),
    );
    const app = createGitHubApp(config);
    await expect(
      app.deleteFile("x.md", { sha: "abc", message: "delete" }),
    ).rejects.toMatchObject({ kind: "forbidden" });
  });

  it("deleteFile maps unknown HTTP error to GitHubAppError(unknown)", async () => {
    server.use(
      tokenHandler(),
      http.delete(`${CONTENTS_BASE}/x.md`, () =>
        new HttpResponse(JSON.stringify({ message: "boom" }), { status: 500 }),
      ),
    );
    const app = createGitHubApp(config);
    await expect(
      app.deleteFile("x.md", { sha: "abc", message: "delete" }),
    ).rejects.toMatchObject({ kind: "unknown" });
  });
});
