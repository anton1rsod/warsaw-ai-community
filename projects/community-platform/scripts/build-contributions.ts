import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  computeContributions,
  type GitCommit,
} from "@/lib/contributions";
import { readAliases, resolveHandle } from "@/lib/git-email-aliases";
import { readRoster } from "@/lib/roster";
import { listMeetings } from "@/lib/meetings";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const OUTPUT = path.resolve(
  __dirname,
  "../lib/__generated__/contributions.json",
);

interface GitLogEntry {
  sha: string;
  author: string;
  date: string;
  files: string[];
}

/**
 * Parse the repo's git log into a flat list of commit metadata + changed files.
 *
 * Security: invokes git via `execFileSync` with no shell — all arguments are
 * hardcoded string literals; no user input ever reaches the subprocess. cwd is
 * a build-time constant (REPO_ROOT). See execution-plan.md §6.5.
 *
 * Author resolution delegates to `resolveHandle` (alias → noreply → local-part).
 * Authors whose resolved handle isn't on the roster are dropped downstream by
 * `computeContributions`, so unknown emails don't pollute counts.
 *
 * If git isn't available (Vercel CLI uploads files without `.git`; sandboxed
 * builds; or git binary missing) we return an empty list rather than crashing
 * the build. The resulting contributions.json shows all-zero counts for every
 * roster member — accurate for that build context. Git-integration deploys
 * (via `git push`) include `.git` and produce real counts.
 */
function parseGitLog(aliases: ReadonlyMap<string, string>): GitLogEntry[] {
  let output: string;
  try {
    output = execFileSync(
      "git",
      ["log", "--pretty=format:COMMIT|%H|%ae|%aI", "--name-only"],
      {
        cwd: REPO_ROOT,
        encoding: "utf8",
        maxBuffer: 100 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
  } catch (err: unknown) {
    const reason =
      err instanceof Error ? err.message.split("\n")[0] : String(err);
    console.warn(
      `[contributions] git log unavailable (${reason}); skipping commit ` +
        "scan. contributions.json will have zero counts for this build.",
    );
    return [];
  }

  const entries: GitLogEntry[] = [];
  let current: GitLogEntry | null = null;

  for (const line of output.split("\n")) {
    if (line.startsWith("COMMIT|")) {
      if (current) entries.push(current);
      const parts = line.slice("COMMIT|".length).split("|");
      const sha = parts[0] ?? "";
      const email = parts[1] ?? "";
      const date = parts[2] ?? "";
      current = {
        sha,
        author: resolveHandle(email, aliases),
        date,
        files: [],
      };
    } else if (line.trim() === "") {
      // Empty separator between commits — skip.
    } else if (current) {
      current.files.push(line.trim());
    }
  }
  if (current) entries.push(current);
  return entries;
}

async function main(): Promise<void> {
  const rosterPath = path.join(REPO_ROOT, "community/members/roster.md");
  const aliasesPath = path.join(
    REPO_ROOT,
    "community/members/git-email-aliases.md",
  );
  const [roster, meetings, aliases] = await Promise.all([
    readRoster(rosterPath),
    listMeetings(REPO_ROOT),
    readAliases(aliasesPath),
  ]);

  const commits: GitCommit[] = parseGitLog(aliases);
  const contributions = computeContributions({ commits, meetings, roster });

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(
    OUTPUT,
    JSON.stringify(contributions, null, 2) + "\n",
    "utf-8",
  );

  console.log(
    `[contributions] wrote ${path.relative(REPO_ROOT, OUTPUT)}\n` +
      `  members: ${Object.keys(contributions).length}\n` +
      `  commits scanned: ${commits.length}\n` +
      `  meetings: ${meetings.length}\n` +
      `  aliases: ${aliases.size}`,
  );
}

main().catch((err: unknown) => {
  console.error("[contributions] failed:", err);
  process.exit(1);
});
