import Link from "next/link";
import { redirect } from "next/navigation";
import { createAppAuth } from "@octokit/auth-app";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { isAdmin, listMembers } from "@/lib/content-snapshot";
import { weekFromDate } from "@/lib/week";
import { readWeekStatuses } from "@/lib/status-reader";
import { computeHealthMetric, type HealthMetric } from "@/lib/health-metric";

// Per execution-plan §9.2 — `/admin/health` makes 4 GitHub API calls
// per render. Without ISR, refresh-spamming the page can blow the
// 5000/hr GitHub rate limit. 60s revalidation caps the worst case at
// 4/min ≈ 240/hr per cache boundary.
export const revalidate = 60;

async function getInstallationToken(): Promise<string> {
  const ghAppAuth = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
  });
  const installation = await ghAppAuth({ type: "installation" });
  return installation.token;
}

interface TrendRow {
  week: string;
  metric: HealthMetric;
}

export default async function AdminHealthPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.githubHandle) redirect("/login");
  if (!isAdmin(session.githubHandle)) redirect("/home");

  const token = await getInstallationToken();
  const roster = listMembers();

  // i=0 is the current week; i=1..3 are the three preceding weeks. We
  // fetch all four in parallel rather than serializing the loop, which
  // both halves wall-clock time and keeps the rate-limit budget tight.
  const trendWeeks: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i * 7);
    trendWeeks.push(weekFromDate(d));
  }

  const trend: TrendRow[] = await Promise.all(
    trendWeeks.map(async (week) => {
      const statuses = await readWeekStatuses({
        week,
        owner: env.GITHUB_REPO_OWNER,
        repo: env.GITHUB_REPO_NAME,
        branch: env.GITHUB_REPO_BRANCH,
        token,
      });
      return { week, metric: computeHealthMetric({ roster, weekStatuses: statuses }) };
    }),
  );

  const current = trend[0];
  if (!current) {
    // trend has 4 entries by construction; this guard exists to keep
    // TypeScript happy under noUncheckedIndexedAccess.
    throw new Error("admin/health: trend computation produced no rows");
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Health metric</h1>
        <Link href="/home" className="text-sm underline">
          Home
        </Link>
      </header>

      <section className="mt-6 rounded border p-4">
        <h2 className="text-xl font-medium">This week ({current.week})</h2>
        <p className="mt-2 text-4xl font-semibold tabular-nums">
          {current.metric.activePosters} / {current.metric.totalMembers}
        </p>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {(current.metric.ratio * 100).toFixed(0)}% active posters this week
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Targets: v0.1 launch 50%+ · v0.2 sustained 60% across 4 weeks · v0.3 sustained 70%
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-medium">4-week trend</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="text-left">
              <th className="border-b py-2">Week</th>
              <th className="border-b py-2">Posters</th>
              <th className="border-b py-2">Ratio</th>
            </tr>
          </thead>
          <tbody>
            {trend.map((t) => (
              <tr key={t.week}>
                <td className="border-b py-2 font-mono">{t.week}</td>
                <td className="border-b py-2 tabular-nums">
                  {t.metric.activePosters}
                </td>
                <td className="border-b py-2 tabular-nums">
                  {(t.metric.ratio * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
