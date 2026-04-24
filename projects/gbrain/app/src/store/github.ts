import { Octokit } from "octokit";

export interface GithubStoreConfig { token: string; owner: string; repo: string; branch: string }
export interface CommitInput { path: string; content: string; message: string }
export interface GithubStore {
  commit(input: CommitInput): Promise<string /* commit sha */>;
  remove(input: { path: string; message: string }): Promise<string>;
}

const BOT_COMMITTER = { name: "gbrain-bot", email: "gbrain-bot@warsaw-ai-community.invalid" };
const ALLOWED_PREFIX = "community/archive/";

function assertAllowedPath(path: string): void {
  if (!path.startsWith(ALLOWED_PREFIX)) {
    throw new Error(`path ${path} is outside ${ALLOWED_PREFIX} — write rejected`);
  }
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
        const existing = await kit.rest.repos.getContent({ ...repoParams, path, ref: branch });
        const data = existing.data as { sha?: string; type?: string };
        if (data.type === "file" && typeof data.sha === "string") sha = data.sha;
      } catch (err: unknown) {
        const status = (err as { status?: number }).status;
        if (status !== 404) throw err;
      }
      const res = await kit.rest.repos.createOrUpdateFileContents({
        ...repoParams, branch, path, message,
        content: Buffer.from(content, "utf8").toString("base64"),
        committer: BOT_COMMITTER, author: BOT_COMMITTER,
        ...(sha ? { sha } : {})
      });
      return res.data.commit.sha ?? "";
    },

    async remove({ path, message }) {
      assertAllowedPath(path);
      const existing = await kit.rest.repos.getContent({ ...repoParams, path, ref: branch });
      const data = existing.data as { sha?: string; type?: string };
      if (data.type !== "file" || typeof data.sha !== "string") {
        throw new Error(`cannot remove non-file at ${path}`);
      }
      const res = await kit.rest.repos.deleteFile({
        ...repoParams, branch, path, message, sha: data.sha,
        committer: BOT_COMMITTER, author: BOT_COMMITTER
      });
      return res.data.commit.sha ?? "";
    }
  };
}
