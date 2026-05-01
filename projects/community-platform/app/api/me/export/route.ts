import { NextResponse } from "next/server";
import { createAppAuth } from "@octokit/auth-app";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import {
  findMemberByHandle,
  getContributions,
} from "@/lib/content-snapshot";
import { readWeekStatuses, type StatusUpdate } from "@/lib/status-reader";
import { currentWeek, weekFromDate } from "@/lib/week";

async function getInstallationToken(): Promise<string> {
  // Local name to avoid shadowing the imported lib/auth `auth()`.
  const ghAppAuth = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
  });
  const installation = await ghAppAuth({ type: "installation" });
  return installation.token;
}

interface ExportedStatus extends StatusUpdate {
  week: string;
}

export async function GET(_req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.githubHandle) {
    return new NextResponse("unauthorized", { status: 401 });
  }
  const member = findMemberByHandle(session.githubHandle);
  if (!member) {
    return new NextResponse("not a member", { status: 403 });
  }

  const token = await getInstallationToken();

  // Last 12 weeks. Full history would require listing the entire
  // community/status/ tree on GitHub; 12 weeks is the spec §6.13 floor
  // for an export and is cheap enough at 12 Contents API calls.
  const seen = new Set<string>();
  const weeks: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i * 7);
    const w = weekFromDate(d);
    if (!seen.has(w)) {
      seen.add(w);
      weeks.push(w);
    }
  }

  const collected = await Promise.all(
    weeks.map(async (week): Promise<ExportedStatus[]> => {
      const statuses = await readWeekStatuses({
        week,
        owner: env.GITHUB_REPO_OWNER,
        repo: env.GITHUB_REPO_NAME,
        branch: env.GITHUB_REPO_BRANCH,
        token,
      });
      // Self-only filter: never expose another member's status updates.
      return statuses
        .filter((s) => s.slug === member.slug)
        .map((s) => ({ ...s, week }));
    }),
  );

  const payload = {
    exportedAt: new Date().toISOString(),
    handle: session.githubHandle,
    member: {
      name: member.name,
      slug: member.slug,
      githubHandle: member.githubHandle,
      profile: member.profile,
      persona: member.persona,
    },
    contributions: getContributions(session.githubHandle),
    statuses: collected.flat(),
    currentWeek: currentWeek(),
  };

  return NextResponse.json(payload);
}
