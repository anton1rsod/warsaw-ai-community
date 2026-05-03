import { NextResponse } from "next/server";
import { createAppAuth } from "@octokit/auth-app";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { createGitHubApp, GitHubAppError } from "@/lib/github-app";
import { readWeekStatuses } from "@/lib/status-reader";
import { weekFromDate } from "@/lib/week";

async function getInstallationToken(): Promise<string> {
  const ghAppAuth = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
  });
  const installation = await ghAppAuth({ type: "installation" });
  return installation.token;
}

export async function POST(_req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.githubHandle) {
    return new NextResponse("unauthorized", { status: 401 });
  }
  const member = findMemberByHandle(session.githubHandle);
  if (!member) {
    return new NextResponse("not a member", { status: 403 });
  }

  // member.slug is derived from the authenticated session — never from the
  // request body. Cross-user deletion is therefore structurally impossible
  // (per execution-plan §6.6 risk register).
  const slug = member.slug;
  const handle = session.githubHandle;

  const client = createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });

  // 1. Profile file (may not exist if member never wrote one).
  const profilePath = `community/members/${slug}.md`;
  const profile = await client.readFile(profilePath);
  if (profile) {
    await client.deleteFile(profilePath, {
      sha: profile.sha,
      message: `chore(gdpr): delete profile for ${handle}`,
    });
  }

  // 2. Status files: 52-week back-scan, filter by caller's slug only.
  const token = await getInstallationToken();
  const seen = new Set<string>();
  const weeks: string[] = [];
  for (let i = 0; i < 52; i += 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i * 7);
    const w = weekFromDate(d);
    if (!seen.has(w)) {
      seen.add(w);
      weeks.push(w);
    }
  }

  for (const week of weeks) {
    const statuses = await readWeekStatuses({
      week,
      owner: env.GITHUB_REPO_OWNER,
      repo: env.GITHUB_REPO_NAME,
      branch: env.GITHUB_REPO_BRANCH,
      token,
    });
    // Self-only filter: never delete another member's file.
    const mine = statuses.find((s) => s.slug === slug);
    if (!mine) continue;
    try {
      await client.deleteFile(`community/status/${week}/${slug}.md`, {
        sha: mine.sha,
        message: `chore(gdpr): delete status ${week} for ${handle}`,
      });
    } catch (err: unknown) {
      // Idempotent re-deletion: if the file vanished between read and delete,
      // treat as success and move on. Other errors propagate to the caller.
      if (err instanceof GitHubAppError && err.kind === "not_found") continue;
      throw err;
    }
  }

  return NextResponse.json({ ok: true });
}
