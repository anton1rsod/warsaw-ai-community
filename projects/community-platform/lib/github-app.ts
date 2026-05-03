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

export interface MultiFileCommitInput {
  readonly files: readonly {
    readonly path: string;
    readonly content: string;
  }[];
  readonly message: string;
  readonly expectedHeadSha: string;
  readonly authorName?: string;
  readonly authorEmail?: string;
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
  commitMultipleFiles(
    input: MultiFileCommitInput,
  ): Promise<{ commitSha: string }>;
  getHeadSha(): Promise<string>;
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
      // Directory listing: getContent returns an array. Treated as null
      // because callers ask for a specific file.
      if (Array.isArray(data)) return null;
      // Symlink / submodule / other non-file content type at the path is
      // a silent-failure trap if mapped to null — Phase 5/6 callers would
      // not be able to distinguish "file missing" from "wrong content
      // type." Surface it explicitly.
      if (data.type !== "file") {
        throw new GitHubAppError(
          "unknown",
          `expected file at ${filePath} but got content type "${data.type}"`,
        );
      }
      // GitHub returns `encoding: "none"` for files >1 MB (content omitted,
      // caller would need to use the Blob API instead). The `as
      // BufferEncoding` cast would silently throw "Unknown encoding: none"
      // inside Buffer.from — surface the size limitation explicitly.
      if (data.encoding !== "base64") {
        throw new GitHubAppError(
          "unknown",
          `unsupported encoding "${data.encoding}" for ${filePath} ` +
            `(file may exceed the 1 MB Contents API limit)`,
        );
      }
      return {
        content: Buffer.from(data.content, "base64").toString("utf8"),
        sha: data.sha,
        path: data.path,
      };
    } catch (err: unknown) {
      if (err instanceof GitHubAppError) throw err;
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

  /**
   * Atomically commits multiple files in a single git commit using the low-level
   * git data API: blob×N → tree → commit → updateRef. CAS is enforced by passing
   * `expectedHeadSha` as the parent commit; if the branch has moved, updateRef
   * returns 409 → GitHubAppError(sha_conflict). The orchestrator (Task 11.1.13)
   * is responsible for the single retry on conflict (H13); this function makes
   * exactly one attempt.
   */
  async function commitMultipleFiles(
    input: MultiFileCommitInput,
  ): Promise<{ commitSha: string }> {
    const author = {
      name: input.authorName ?? DEFAULT_AUTHOR_NAME,
      email: input.authorEmail ?? DEFAULT_AUTHOR_EMAIL,
    };
    try {
      const blobs = await Promise.all(
        input.files.map((f) =>
          octokit.git.createBlob({
            owner: config.owner,
            repo: config.repo,
            content: Buffer.from(f.content, "utf8").toString("base64"),
            encoding: "base64",
          }),
        ),
      );

      const parentCommit = await octokit.git.getCommit({
        owner: config.owner,
        repo: config.repo,
        commit_sha: input.expectedHeadSha,
      });
      const baseTreeSha = parentCommit.data.tree.sha;

      const tree = await octokit.git.createTree({
        owner: config.owner,
        repo: config.repo,
        base_tree: baseTreeSha,
        tree: input.files.map((f, i) => {
          const blobSha = blobs[i]?.data.sha ?? "";
          return {
            path: f.path,
            mode: "100644" as const,
            type: "blob" as const,
            sha: blobSha,
          };
        }),
      });

      const commit = await octokit.git.createCommit({
        owner: config.owner,
        repo: config.repo,
        message: input.message,
        tree: tree.data.sha,
        parents: [input.expectedHeadSha],
        author,
        committer: author,
      });

      await octokit.git.updateRef({
        owner: config.owner,
        repo: config.repo,
        ref: `heads/${config.branch}`,
        sha: commit.data.sha,
        force: false,
      });

      return { commitSha: commit.data.sha };
    } catch (err: unknown) {
      if (err instanceof GitHubAppError) throw err;
      throw mapError(err);
    }
  }

  /**
   * Returns the current commit SHA at the tip of the configured branch.
   * Used by the orchestrator (Task 11.1.13) as the CAS anchor passed as
   * `expectedHeadSha` to `commitMultipleFiles`.
   */
  async function getHeadSha(): Promise<string> {
    try {
      const { data } = await octokit.git.getRef({
        owner: config.owner,
        repo: config.repo,
        ref: `heads/${config.branch}`,
      });
      return data.object.sha;
    } catch (err: unknown) {
      if (err instanceof GitHubAppError) throw err;
      throw mapError(err);
    }
  }

  return { readFile, writeFile, deleteFile, commitMultipleFiles, getHeadSha };
}

/**
 * Strips request headers from the Octokit error before attaching it as
 * `cause`. Octokit's RequestError carries the request object including
 * `headers.authorization`, which during installation auth holds a short-lived
 * `ghs_xxx` installation token (1h TTL, contents:write on the configured
 * repo). Without stripping, any caller that does `console.error(err)` or
 * forwards `err.cause` to a structured logger would capture the token.
 */
function sanitizeCause(err: unknown): unknown {
  if (err === null || err === undefined || typeof err !== "object") return err;
  const e = err as Record<string, unknown>;
  const reqRaw = e.request;
  if (!reqRaw || typeof reqRaw !== "object") return err;
  const req = reqRaw as Record<string, unknown>;
  const headers = req.headers;
  if (!headers || typeof headers !== "object") return err;
  const safeHeaders = { ...(headers as Record<string, unknown>) };
  delete safeHeaders.authorization;
  return { ...e, request: { ...req, headers: safeHeaders } };
}

/**
 * Maps an Octokit / fetch error to a GitHubAppError. Exported so unit tests
 * can exercise every status branch (including the ones the public wrapper
 * methods don't reach in normal Octokit operation, e.g., non-Error rejections).
 *
 * 401 is mapped to `forbidden` because v0.1 callers don't need to distinguish
 * "expired token" from "missing scope" — both surface as "bot can't perform
 * this op." If a future caller needs the distinction, add an `unauthorized`
 * kind without breaking existing handlers.
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
  const safeCause = sanitizeCause(err);
  switch (status) {
    case 404:
      return new GitHubAppError("not_found", message, safeCause);
    case 409:
      return new GitHubAppError("sha_conflict", message, safeCause);
    case 401:
    case 403:
      return new GitHubAppError("forbidden", message, safeCause);
    default:
      return new GitHubAppError("unknown", message, safeCause);
  }
}
