import Link from "next/link";
import { createAppAuth } from "@octokit/auth-app";
import { auth } from "@/lib/auth";
import { s } from "@/lib/i18n/strings";
import { MonoLabel } from "@/app/components/MonoLabel";
import { env } from "@/lib/env";
import { findMemberByHandle, listMeetingsFromSnapshot, listEventsFromSnapshot } from "@/lib/content-snapshot";
import { currentWeek } from "@/lib/week";
import { HomeFeed } from "@/app/components/HomeFeed";
import { computeHomeFeed } from "@/lib/home-feed";
import {
  readWeekStatuses,
  type StatusUpdate,
} from "@/lib/status-reader";
import matter from "gray-matter";
import { parseMarkdown, renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";
import { parseStatusMode } from "@/lib/shipping-log";
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
import {
  isE2EMode as isE2EModeThank,
  mockThankActions,
} from "@/app/actions/_test-thank-store";
import { isProductionRuntime } from "@/lib/runtime-env";
import { createGitHubApp } from "@/lib/github-app";
import {
  parseProfileFrontmatter,
  deriveThankInitialState,
  type ProfileFrontmatter,
} from "@/lib/profile-editor";
import { ThankButton } from "@/app/components/ThankButton";

// Dynamic rendering for v0.1 — every request triggers a fresh fetch.
// Phase 5 ships without ISR because the bot commit + GitHub propagation +
// 60s cache + SHA-conflict resolution stack is hard to reason about for
// a solo founder build. A later iteration can re-introduce
// `revalidate = 60` once the timing risks (execution-plan §6.3) are
// understood operationally.
export const dynamic = "force-dynamic";

async function fetchStatuses(week: string): Promise<StatusUpdate[]> {
  // E2E read path: in-memory store seeded by the actions in this same
  // process. Double-guarded (NODE_ENV + E2E flag) so the fork is dead in
  // production even if NEXT_PUBLIC_E2E_MODE leaked into a prod build —
  // matches loadViewerProfile and the v0.9.1 write-path mock forks.
  // lastModified is filled in lazily so the sort path stays identical
  // to production.
  if (!isProductionRuntime() && isE2EMode()) {
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

async function loadViewerProfile(
  slug: string | undefined,
): Promise<{ fm: ProfileFrontmatter | undefined; sha: string | undefined }> {
  if (!slug) return { fm: undefined, sha: undefined };
  // E2E mode: return a stable mock sha from the thanks store so ThankButton
  // receives a non-empty profileSha and can call thankStatus. No GitHub App
  // call is made. Double-guarded (NODE_ENV + E2E flag) so the fork is dead in
  // production even if NEXT_PUBLIC_E2E_MODE leaked into a prod build.
  if (!isProductionRuntime() && isE2EModeThank()) {
    return { fm: undefined, sha: mockThankActions.getProfileSha(slug) };
  }
  try {
    const client = createGitHubApp({
      appId: env.GITHUB_APP_ID,
      privateKey: env.GITHUB_APP_PRIVATE_KEY,
      installationId: env.GITHUB_APP_INSTALLATION_ID,
      owner: env.GITHUB_REPO_OWNER,
      repo: env.GITHUB_REPO_NAME,
      branch: env.GITHUB_REPO_BRANCH,
    });
    const file = await client.readFile(`community/members/${slug}.md`);
    if (!file) return { fm: undefined, sha: undefined };
    const { fm } = parseProfileFrontmatter(file.content);
    return { fm, sha: file.sha };
  } catch {
    return { fm: undefined, sha: undefined };
  }
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

  const { fm: viewerProfile, sha: viewerProfileSha } =
    await loadViewerProfile(mySlug);

  // Strip frontmatter for display: the action layer always emits
  // `---\nweek/author/mode/updated_at\n---\n\n<body>` so the user only
  // sees their actual update text in the editor and on the feed.
  const renderedOthers = await Promise.all(
    statuses
      .filter((s) => s.slug !== mySlug)
      .map(async (s) => {
        const parsed = matter(s.body);
        let mode: "rich" | "shipping-log";
        try {
          mode = parseStatusMode(parsed.data.mode);
        } catch {
          // H117 read-time forward-compat: unknown modes default to rich
          mode = "rich";
        }
        const bodyText = parsed.content.trim();
        const html =
          mode === "shipping-log"
            ? null
            : await renderMarkdownToHtml(bodyText);
        return {
          slug: s.slug,
          mode,
          html,
          bodyText,
          lastModified: s.lastModified,
        };
      }),
  );

  const myStripped = my ? parseMarkdown(my.body).body : null;

  const kickerText = s("thisweek.kickerFmt").replace("{week}", week);
  const othersLabel = s("thisweek.othersLabelFmt").replace(
    "{count}",
    String(renderedOthers.length),
  );

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>{kickerText}</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {s("thisweek.title")}
      </h1>

      <div className="mt-6">
        <HomeFeed feed={feed} showRecent={false} />
      </div>

      {member ? (
        <section aria-labelledby="your-update-heading" className="mt-8">
          <MonoLabel>{s("thisweek.yourUpdate")}</MonoLabel>
          <h2 id="your-update-heading" className="sr-only">
            Your update
          </h2>
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

      <section aria-labelledby="others-heading" className="mt-8">
        <MonoLabel>{othersLabel}</MonoLabel>
        <h2 id="others-heading" className="sr-only">
          Others
        </h2>
        {renderedOthers.length === 0 ? (
          <p className="mt-2 font-voice text-[12px] text-dust">
            No other status updates yet.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {renderedOthers.map((o) => (
              <li key={o.slug} className="bg-paper border-l-[3px] border-l-ink px-4 py-3">
                <div className="font-display font-semibold text-ink text-[13px]">
                  <Link href={`/members/${o.slug}`} className="text-ink underline">
                    {o.slug}
                  </Link>
                </div>
                {o.mode === "shipping-log" ? (
                  <blockquote className="prose-warm mt-2 text-sm border-l-[2px] border-l-dust pl-3 italic">
                    {o.bodyText}
                  </blockquote>
                ) : (
                  <SafeHtml
                    html={o.html ?? ""}
                    className="prose-warm mt-2 text-sm"
                  />
                )}
                <time
                  dateTime={o.lastModified}
                  className="mt-2 block font-voice text-[10px] text-dust"
                >
                  {o.lastModified}
                </time>
                <div className="mt-2">
                  <ThankButton
                    recipient={o.slug}
                    itemType="status"
                    itemId={`${week}/${o.slug}`}
                    initialState={deriveThankInitialState(
                      mySlug,
                      o.slug,
                      "status",
                      `${week}/${o.slug}`,
                      viewerProfile,
                    )}
                    profileSha={viewerProfileSha}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
