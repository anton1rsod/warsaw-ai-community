import Link from "next/link";
import { createAppAuth } from "@octokit/auth-app";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle, listMeetingsFromSnapshot, listEventsFromSnapshot } from "@/lib/content-snapshot";
import { currentWeek } from "@/lib/week";
import { HomeFeed } from "@/app/components/HomeFeed";
import { computeHomeFeed } from "@/lib/home-feed";
import {
  readWeekStatuses,
  type StatusUpdate,
} from "@/lib/status-reader";
import { parseMarkdown, renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";
import { StatusEditor } from "@/app/components/StatusEditor";
import {
  deleteStatus,
  editStatus,
  postStatus,
} from "@/app/actions/status";
import {
  isE2EMode,
  mockStatusActions,
} from "@/app/actions/_test-status-store";

// Dynamic rendering for v0.1 — every request triggers a fresh fetch.
// Phase 5 ships without ISR because the bot commit + GitHub propagation +
// 60s cache + SHA-conflict resolution stack is hard to reason about for
// a solo founder build. A later iteration can re-introduce
// `revalidate = 60` once the timing risks (execution-plan §6.3) are
// understood operationally.
export const dynamic = "force-dynamic";

async function fetchStatuses(week: string): Promise<StatusUpdate[]> {
  if (isE2EMode()) {
    // E2E read path: in-memory store seeded by the actions in this same
    // process. lastModified is filled in lazily so the sort path stays
    // identical to production.
    const now = new Date().toISOString();
    return mockStatusActions
      .list(week)
      .map((s) => ({ ...s, lastModified: now }));
  }
  const token = await getInstallationToken();
  return readWeekStatuses({
    week,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
    token,
  });
}

async function getInstallationToken(): Promise<string> {
  // Distinct local identifier so it doesn't shadow the imported lib/auth.
  const ghAppAuth = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
  });
  const installation = await ghAppAuth({ type: "installation" });
  return installation.token;
}

export default async function ThisWeekPage(): Promise<React.JSX.Element> {
  const week = currentWeek();
  const session = await auth();
  const handle = session?.githubHandle ?? "";
  const member = handle ? findMemberByHandle(handle) : undefined;

  const feed = computeHomeFeed({
    meetings: listMeetingsFromSnapshot(),
    events: listEventsFromSnapshot(),
    statusPosts: [],
    contributions: [],
    now: new Date(),
  });

  const statuses = await fetchStatuses(week);

  const mySlug = member?.slug;
  const my = mySlug
    ? (statuses.find((s) => s.slug === mySlug) ?? null)
    : null;

  // Strip frontmatter for display: the action layer always emits
  // `---\nweek/author/posted_at\n---\n\n<body>` so the user only sees
  // their actual update text in the editor and on the feed.
  const renderedOthers = await Promise.all(
    statuses
      .filter((s) => s.slug !== mySlug)
      .map(async (s) => {
        const { body } = parseMarkdown(s.body);
        return {
          slug: s.slug,
          html: await renderMarkdownToHtml(body),
          lastModified: s.lastModified,
        };
      }),
  );

  const myStripped = my ? parseMarkdown(my.body).body : null;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">This week — {week}</h1>
        <Link href="/home" className="text-sm underline">
          Home
        </Link>
      </header>

      <div className="mt-6">
        <HomeFeed feed={feed} showRecent={false} />
      </div>

      {member ? (
        <section className="mt-6">
          <h2 className="text-xl font-medium">Your update</h2>
          <div className="mt-2">
            <StatusEditor
              week={week}
              current={
                my && myStripped !== null
                  ? { body: myStripped, sha: my.sha }
                  : null
              }
              actions={{ postStatus, editStatus, deleteStatus }}
            />
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xl font-medium">
          Others ({renderedOthers.length})
        </h2>
        {renderedOthers.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            No other status updates yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {renderedOthers.map((o) => (
              <li key={o.slug} className="rounded border p-4">
                <div className="text-sm font-medium">
                  <Link href={`/members/${o.slug}`} className="underline">
                    {o.slug}
                  </Link>
                </div>
                <SafeHtml
                  html={o.html}
                  className="prose prose-neutral mt-2 max-w-none text-sm dark:prose-invert"
                />
                <time
                  dateTime={o.lastModified}
                  className="mt-2 block text-xs text-neutral-500"
                >
                  {o.lastModified}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
