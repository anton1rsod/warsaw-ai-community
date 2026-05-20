import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { createGitHubApp, type GitHubAppClient } from "@/lib/github-app";
import {
  findMemberByHandle,
  listEventsFromSnapshot,
} from "@/lib/content-snapshot";
import { parseProfileFrontmatter } from "@/lib/profile-editor";
import { EventSlugSchema } from "@/lib/events";

export const dynamic = "force-dynamic";

type ViewerState = "going" | "interested" | "none";

function buildClient(): GitHubAppClient {
  return createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });
}

function jsonError(
  error: string,
  status: number,
): NextResponse {
  return NextResponse.json(
    { error },
    {
      status,
      // Per-request user-specific lookup; must never be edge-cached
      // (mirrors H56 posture on /home).
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}

/**
 * GET /api/event-rsvp-state?slug=YYYY-MM-DD-kebab
 *
 * Returns the signed-in viewer's RSVP state for the given event, plus the
 * current profile SHA needed for the H31 SHA-gated write in rsvpEvent.
 *
 * Why: /events/[slug] is SSG (O6 lock) — the page HTML is built without
 * session context, so EventRsvpButton ships with `initialState="not-signed-in"`
 * for all visitors. This route lets a signed-in client hydrate the button
 * to the real state on mount, preserving SSG caching for anonymous viewers
 * while restoring a working RSVP UI for members.
 */
export async function GET(req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.githubHandle) {
    return jsonError("not_authenticated", 401);
  }
  const member = findMemberByHandle(session.githubHandle);
  if (!member) {
    return jsonError("not_a_member", 403);
  }

  const url = new URL(req.url);
  const slugParam = url.searchParams.get("slug");
  if (!slugParam) {
    return jsonError("invalid_slug", 400);
  }
  const parsedSlug = EventSlugSchema.safeParse(slugParam);
  if (!parsedSlug.success) {
    return jsonError("invalid_slug", 400);
  }
  const slug = parsedSlug.data;

  const known = listEventsFromSnapshot().some((e) => e.slug === slug);
  if (!known) {
    return jsonError("event_not_found", 404);
  }

  const gh = buildClient();
  const file = await gh.readFile(`community/members/${member.slug}.md`);
  if (!file) {
    return jsonError("internal_error", 500);
  }

  const { fm } = parseProfileFrontmatter(file.content);
  const state: ViewerState = fm.events_going.includes(slug)
    ? "going"
    : fm.events_interested.includes(slug)
      ? "interested"
      : "none";

  return NextResponse.json(
    { state, profileSha: file.sha },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
