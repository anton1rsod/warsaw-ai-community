import Link from "next/link";
import { createAppAuth } from "@octokit/auth-app";
import { env } from "@/lib/env";
import { listMembers } from "@/lib/content-snapshot";
import { requireAdmin } from "@/lib/require-admin";
import { weekFromDate } from "@/lib/week";
import { readWeekStatuses } from "@/lib/status-reader";
import { computeHealthMetric, type HealthMetric } from "@/lib/health-metric";
import { MonoLabel } from "@/app/components/MonoLabel";

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
  await requireAdmin("/admin/health");

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
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-baseline justify-between">
        <div>
          <MonoLabel>Admin</MonoLabel>
          <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
            Health metric
          </h1>
        </div>
        <Link href="/home" className="font-voice text-[11px] text-dust underline">
          Home
        </Link>
      </div>

      <section className="mt-6 bg-paper border-l-[3px] border-l-ink p-4">
        <p className="font-voice text-[11px] uppercase tracking-[1px] text-dust">
          This week — {current.week}
        </p>
        <p className="mt-2 font-voice text-[40px] tabular-nums text-ink">
          {current.metric.activePosters} / {current.metric.totalMembers}
        </p>
        <p className="mt-1 font-voice text-[11px] text-dust">
          {(current.metric.ratio * 100).toFixed(0)}% active posters this week
        </p>
        <p className="mt-2 font-voice text-[11px] text-dust">
          Targets: v0.1 launch 50%+ · v0.2 sustained 60% across 4 weeks · v0.3 sustained 70%
        </p>
      </section>

      <section className="mt-6">
        <p className="font-voice text-[11px] uppercase tracking-[1px] text-dust">
          4-week trend
        </p>
        <table className="mt-3 w-full border-collapse">
          <thead>
            <tr>
              <th className="font-voice text-[11px] uppercase tracking-[1px] text-dust text-left py-2">Week</th>
              <th className="font-voice text-[11px] uppercase tracking-[1px] text-dust text-left py-2">Posters</th>
              <th className="font-voice text-[11px] uppercase tracking-[1px] text-dust text-left py-2">Ratio</th>
            </tr>
          </thead>
          <tbody>
            {trend.map((t) => (
              <tr key={t.week}>
                <td className="border-b border-ink/15 font-voice text-ink py-2">{t.week}</td>
                <td className="border-b border-ink/15 font-voice text-ink tabular-nums py-2">
                  {t.metric.activePosters}
                </td>
                <td className="border-b border-ink/15 font-voice text-dust tabular-nums py-2">
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
