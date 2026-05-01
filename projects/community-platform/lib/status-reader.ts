import { Octokit } from "@octokit/rest";

export interface StatusUpdate {
  slug: string;
  body: string;
  sha: string;
  lastModified: string;
}

export interface ReadWeekStatusesOpts {
  week: string;
  owner: string;
  repo: string;
  branch: string;
  /** Installation token (`ghs_xxx`) — short-lived, fetched per request via createAppAuth in the page. */
  token: string;
}

/**
 * Lists status files at `community/status/<week>/` and returns their parsed
 * bodies, sorted by lastModified descending.
 *
 * - Returns `[]` when the directory does not exist (404 from getContent).
 * - Returns `[]` when the path resolves to a file (defensive — would only
 *   happen on accidental config drift; week dirs are bot-managed).
 * - Skips non-markdown entries and any entry that fails to fetch as a file
 *   (e.g., race where the path became a directory between listing and
 *   content fetch).
 * - Non-404 errors propagate so the caller's `revalidate = 60` ISR sees the
 *   failure rather than silently rendering an empty week.
 */
export async function readWeekStatuses(
  opts: ReadWeekStatusesOpts,
): Promise<StatusUpdate[]> {
  const octokit = new Octokit({ auth: opts.token });
  const dirPath = `community/status/${opts.week}`;

  let entries: { name: string; path: string; sha: string; type: string }[];
  try {
    const { data } = await octokit.repos.getContent({
      owner: opts.owner,
      repo: opts.repo,
      path: dirPath,
      ref: opts.branch,
    });
    if (!Array.isArray(data)) return [];
    entries = data;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "status" in err &&
      (err as { status: number }).status === 404
    ) {
      return [];
    }
    throw err;
  }

  const files = entries.filter(
    (e) => e.type === "file" && e.name.endsWith(".md"),
  );

  const statuses = await Promise.all(
    files.map(async (f) => {
      const [contentRes, commitRes] = await Promise.all([
        octokit.repos.getContent({
          owner: opts.owner,
          repo: opts.repo,
          path: f.path,
          ref: opts.branch,
        }),
        octokit.repos.listCommits({
          owner: opts.owner,
          repo: opts.repo,
          path: f.path,
          per_page: 1,
        }),
      ]);

      if (
        Array.isArray(contentRes.data) ||
        contentRes.data.type !== "file" ||
        contentRes.data.encoding !== "base64"
      ) {
        return null;
      }

      const body = Buffer.from(contentRes.data.content, "base64").toString(
        "utf8",
      );
      const lastModified =
        commitRes.data[0]?.commit.committer?.date ??
        new Date().toISOString();

      return {
        slug: f.name.replace(/\.md$/, ""),
        body,
        sha: contentRes.data.sha,
        lastModified,
      };
    }),
  );

  return statuses
    .filter((s): s is StatusUpdate => s !== null)
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
}
