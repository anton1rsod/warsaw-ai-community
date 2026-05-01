import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  installationId: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface FileResult {
  content: string;
  sha: string;
  path: string;
}

export interface WriteOptions {
  message: string;
  sha?: string;
  authorName?: string;
  authorEmail?: string;
}

export interface DeleteOptions {
  message: string;
  sha: string;
  authorName?: string;
  authorEmail?: string;
}

export type GitHubAppErrorKind =
  | "sha_conflict"
  | "not_found"
  | "forbidden"
  | "unknown";

export class GitHubAppError extends Error {
  public readonly kind: GitHubAppErrorKind;
  constructor(kind: GitHubAppErrorKind, message: string, cause?: unknown) {
    // `cause` is delegated to the standard Error.cause (lib.es2022) so we
    // don't need to redeclare the field and trip noImplicitOverride.
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = "GitHubAppError";
    this.kind = kind;
  }
}

export interface GitHubAppClient {
  readFile(path: string): Promise<FileResult | null>;
  writeFile(
    path: string,
    content: string,
    options: WriteOptions,
  ): Promise<{ sha: string }>;
  deleteFile(path: string, options: DeleteOptions): Promise<void>;
}

const DEFAULT_AUTHOR_NAME = "warsaw-ai-bot";
const DEFAULT_AUTHOR_EMAIL = "warsaw-ai-bot@users.noreply.github.com";

export function createGitHubApp(config: GitHubAppConfig): GitHubAppClient {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: config.appId,
      privateKey: config.privateKey,
      installationId: config.installationId,
    },
  });

  async function readFile(filePath: string): Promise<FileResult | null> {
    try {
      const { data } = await octokit.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path: filePath,
        ref: config.branch,
      });
      if (Array.isArray(data) || data.type !== "file") return null;
      return {
        content: Buffer.from(
          data.content,
          data.encoding as BufferEncoding,
        ).toString("utf8"),
        sha: data.sha,
        path: data.path,
      };
    } catch (err: unknown) {
      const mapped = mapError(err);
      if (mapped.kind === "not_found") return null;
      throw mapped;
    }
  }

  async function writeFile(
    filePath: string,
    content: string,
    options: WriteOptions,
  ): Promise<{ sha: string }> {
    const author = {
      name: options.authorName ?? DEFAULT_AUTHOR_NAME,
      email: options.authorEmail ?? DEFAULT_AUTHOR_EMAIL,
    };
    try {
      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner: config.owner,
        repo: config.repo,
        path: filePath,
        message: options.message,
        content: Buffer.from(content, "utf8").toString("base64"),
        branch: config.branch,
        ...(options.sha ? { sha: options.sha } : {}),
        committer: author,
        author,
      });
      const newSha = data.content?.sha;
      if (!newSha) {
        throw new GitHubAppError(
          "unknown",
          "writeFile response missing content.sha",
        );
      }
      return { sha: newSha };
    } catch (err: unknown) {
      if (err instanceof GitHubAppError) throw err;
      throw mapError(err);
    }
  }

  async function deleteFile(
    filePath: string,
    options: DeleteOptions,
  ): Promise<void> {
    const author = {
      name: options.authorName ?? DEFAULT_AUTHOR_NAME,
      email: options.authorEmail ?? DEFAULT_AUTHOR_EMAIL,
    };
    try {
      await octokit.repos.deleteFile({
        owner: config.owner,
        repo: config.repo,
        path: filePath,
        message: options.message,
        sha: options.sha,
        branch: config.branch,
        committer: author,
        author,
      });
    } catch (err: unknown) {
      throw mapError(err);
    }
  }

  return { readFile, writeFile, deleteFile };
}

/**
 * Maps an Octokit / fetch error to a GitHubAppError. Exported so unit tests
 * can exercise every status branch (including the ones the public wrapper
 * methods don't reach in normal Octokit operation, e.g., non-Error rejections).
 */
export function mapError(err: unknown): GitHubAppError {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "github app error";
  const rawStatus =
    err && typeof err === "object" && "status" in err
      ? (err as { status: unknown }).status
      : undefined;
  const status = typeof rawStatus === "number" ? rawStatus : undefined;
  switch (status) {
    case 404:
      return new GitHubAppError("not_found", message, err);
    case 409:
      return new GitHubAppError("sha_conflict", message, err);
    case 403:
      return new GitHubAppError("forbidden", message, err);
    default:
      return new GitHubAppError("unknown", message, err);
  }
}
