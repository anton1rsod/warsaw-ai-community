import { Octokit } from "octokit";

export interface GithubStoreConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}
export interface CommitInput {
  path: string;
  content: string;
  message: string;
}
export interface DirEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  sha: string;
}
export interface GithubStore {
  commit(input: CommitInput): Promise<string /* commit sha */>;
  remove(input: { path: string; message: string }): Promise<string>;
  readJson<T = unknown>(path: string): Promise<T | null>;
  listDir(path: string): Promise<DirEntry[]>;
}

const BOT_COMMITTER = {
  name: "gbrain-bot",
  email: "gbrain-bot@warsaw-ai-community.invalid"
};
export const ALLOWED_PREFIX = "community/archive/";

function assertAllowedPath(path: string): void {
  if (!path.startsWith(ALLOWED_PREFIX)) {
    throw new Error(`path ${path} is outside ${ALLOWED_PREFIX} — write rejected`);
  }
  if (path.split("/").some((segment) => segment === "..")) {
    throw new Error(`path ${path} contains traversal segment — write rejected`);
  }
}

function returnedSha(res: { data: { commit: { sha?: string } } }, op: "commit" | "remove"): string {
  const sha = res.data.commit.sha;
  if (typeof sha !== "string" || sha.length === 0) {
    throw new Error(`GitHub API returned no sha for ${op}`);
  }
  return sha;
}

function statusOf(err: unknown): number | undefined {
  return typeof err === "object" && err !== null
    ? (err as { status?: number }).status
    : undefined;
}

export function createGithubStore(cfg: GithubStoreConfig): GithubStore {
  const kit = new Octokit({ auth: cfg.token });
  const { owner, repo, branch } = cfg;
  const repoParams = { owner, repo };

  return {
    async commit({ path, content, message }) {
      assertAllowedPath(path);
      let sha: string | undefined;
      try {
        const existing = await kit.rest.repos.getContent({
          ...repoParams,
          path,
          ref: branch
        });
        const data = existing.data as { sha?: string; type?: string };
        if (data.type === "file" && typeof data.sha === "string") sha = data.sha;
      } catch (err: unknown) {
        if (statusOf(err) !== 404) throw err;
      }
      const res = await kit.rest.repos.createOrUpdateFileContents({
        ...repoParams,
        branch,
        path,
        message,
        content: Buffer.from(content, "utf8").toString("base64"),
        committer: BOT_COMMITTER,
        author: BOT_COMMITTER,
        ...(sha ? { sha } : {})
      });
      return returnedSha(res, "commit");
    },

    async remove({ path, message }) {
      assertAllowedPath(path);
      const existing = await kit.rest.repos.getContent({
        ...repoParams,
        path,
        ref: branch
      });
      const data = existing.data as { sha?: string; type?: string };
      if (data.type !== "file" || typeof data.sha !== "string") {
        throw new Error(`cannot remove non-file at ${path}`);
      }
      const res = await kit.rest.repos.deleteFile({
        ...repoParams,
        branch,
        path,
        message,
        sha: data.sha,
        committer: BOT_COMMITTER,
        author: BOT_COMMITTER
      });
      return returnedSha(res, "remove");
    },

    async readJson<T = unknown>(path: string): Promise<T | null> {
      try {
        const res = await kit.rest.repos.getContent({
          ...repoParams,
          path,
          ref: branch
        });
        const data = res.data as {
          type?: string;
          content?: string;
          encoding?: string;
        };
        if (data.type !== "file" || typeof data.content !== "string") {
          return null;
        }
        const decoded = Buffer.from(data.content, "base64").toString("utf8");
        return JSON.parse(decoded) as T;
      } catch (err: unknown) {
        if (statusOf(err) === 404) return null;
        throw err;
      }
    },

    async listDir(path: string): Promise<DirEntry[]> {
      try {
        const res = await kit.rest.repos.getContent({
          ...repoParams,
          path,
          ref: branch
        });
        const data = res.data;
        if (!Array.isArray(data)) return [];
        const result: DirEntry[] = [];
        for (const entry of data) {
          if (entry.type !== "file" && entry.type !== "dir") continue;
          result.push({
            name: entry.name,
            path: entry.path,
            type: entry.type,
            sha: entry.sha
          });
        }
        return result;
      } catch (err: unknown) {
        if (statusOf(err) === 404) return [];
        throw err;
      }
    }
  };
}
