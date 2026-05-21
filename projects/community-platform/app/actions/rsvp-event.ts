"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import {
  createGitHubApp,
  GitHubAppError,
  type GitHubAppClient,
} from "@/lib/github-app";
import {
  findMemberByHandle,
  listEventsFromSnapshot,
} from "@/lib/content-snapshot";
import {
  composeProfile,
  parseProfileFrontmatter,
} from "@/lib/profile-editor";
import { EventSlugSchema, type EventSlug } from "@/lib/events";
import { safeHandle as toSafeHandle } from "@/lib/handles";
import { log } from "@/lib/log";

const RsvpInputSchema = z.object({
  eventSlug: z.string(),
  desiredState: z.enum(["going", "interested", "none"]),
  profileSha: z.string().min(1),
});
export type RsvpInput = z.infer<typeof RsvpInputSchema>;

export type RsvpResult =
  | { ok: true; state: "going" | "interested" | "none" }
  | {
      ok: false;
      error:
        | "not_authenticated"
        | "not_a_member"
        | "event_not_found"
        | "invalid_input"
        | "refresh_needed"
        | "internal_error";
    };

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

function profilePath(slug: string): string {
  return `community/members/${slug}.md`;
}

function isKnownEvent(slug: string): slug is EventSlug {
  const parsed = EventSlugSchema.safeParse(slug);
  if (!parsed.success) return false;
  return listEventsFromSnapshot().some((e) => e.slug === parsed.data);
}

interface ReconcileResult {
  going: string[];
  interested: string[];
  priorState: "going" | "interested" | "none";
}

function reconcileArrays(
  prior: { going: readonly string[]; interested: readonly string[] },
  eventSlug: string,
  desired: "going" | "interested" | "none",
): ReconcileResult {
  const priorGoing = prior.going.includes(eventSlug);
  const priorInterested = prior.interested.includes(eventSlug);
  const priorState: "going" | "interested" | "none" = priorGoing
    ? "going"
    : priorInterested
      ? "interested"
      : "none";

  const going = prior.going.filter((s) => s !== eventSlug);
  const interested = prior.interested.filter((s) => s !== eventSlug);

  if (desired === "going") going.push(eventSlug);
  else if (desired === "interested") interested.push(eventSlug);

  return { going, interested, priorState };
}

function commitMessage(
  handle: string,
  desired: "going" | "interested" | "none",
  eventSlug: string,
): string {
  // Defense-in-depth: strip CR/LF + cap at 39 chars via lib/handles. GitHub
  // already enforces alphanumeric+hyphen + ≤39 char on login, but the
  // injection boundary should not rely on an external party's invariant.
  const safeHandle = toSafeHandle(handle);
  return (
    `chore(community): @${safeHandle} RSVP ${desired} "${eventSlug}"\n\n` +
    `Co-Authored-By: ${safeHandle} <${safeHandle}@users.noreply.github.com>\n`
  );
}

export async function rsvpEvent(input: RsvpInput): Promise<RsvpResult> {
  const parsed = RsvpInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const session = await auth();
  const handle = session?.githubHandle;
  if (!handle || typeof handle !== "string") {
    return { ok: false, error: "not_authenticated" };
  }

  const member = findMemberByHandle(handle);
  if (!member) return { ok: false, error: "not_a_member" };

  if (!isKnownEvent(parsed.data.eventSlug)) {
    return { ok: false, error: "event_not_found" };
  }

  const path = profilePath(member.slug);
  const gh = buildClient();
  const file = await gh.readFile(path);
  if (!file) return { ok: false, error: "internal_error" };

  // H31: SHA-gated — refuse if loaded SHA doesn't match current file SHA.
  if (file.sha !== parsed.data.profileSha) {
    log.warn("rsvp-event", "sha_mismatch", {
      slug: member.slug,
      loaded: parsed.data.profileSha,
      current: file.sha,
    });
    return { ok: false, error: "refresh_needed" };
  }

  const { fm, body } = parseProfileFrontmatter(file.content);

  const recon = reconcileArrays(
    { going: fm.events_going, interested: fm.events_interested },
    parsed.data.eventSlug,
    parsed.data.desiredState,
  );

  const newFm = {
    ...fm,
    events_going: recon.going,
    events_interested: recon.interested,
    // H46: visibility default — set members_only on first RSVP if absent.
    event_rsvp_visibility: fm.event_rsvp_visibility ?? "members_only",
  };

  const newContent = composeProfile(
    newFm as unknown as Parameters<typeof composeProfile>[0],
    body,
  );

  try {
    await gh.writeFile(path, newContent, {
      message: commitMessage(handle, parsed.data.desiredState, parsed.data.eventSlug),
      sha: parsed.data.profileSha,
    });
  } catch (err: unknown) {
    if (err instanceof GitHubAppError && err.kind === "sha_conflict") {
      log.warn("rsvp-event", "sha_conflict", {
        slug: member.slug,
        event: parsed.data.eventSlug,
      });
      return { ok: false, error: "refresh_needed" };
    }
    log.error("rsvp-event", "writeFile_failed", {
      reason: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "internal_error" };
  }

  revalidatePath(`/events/${parsed.data.eventSlug}`);
  revalidatePath(`/members/${member.slug}`);

  log.warn("rsvp-event", "updated", {
    slug: member.slug,
    from: recon.priorState,
    to: parsed.data.desiredState,
    event: parsed.data.eventSlug,
  });
  return { ok: true, state: parsed.data.desiredState };
}
