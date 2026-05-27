/**
 * In-memory mock store for RSVP E2E tests. Active only when
 * NEXT_PUBLIC_E2E_MODE === "1". Backs both rsvp-event.ts (write) and the
 * /api/event-rsvp-state hydration read so the toggle is deterministic.
 * Coverage-excluded in vitest.config.ts — E2E-only.
 *
 * Why globalThis: Next 16 "use server" files are bundled into a separate
 * module graph from server components / route handlers. Without the hop,
 * action writes and page/route reads land in different instances and
 * Playwright sees stale state.
 */
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";

interface MockRsvpShared {
  state: Map<string, "going" | "interested" | "none">; // key = `${memberSlug}:${eventSlug}`
  sha: Map<string, string>; // memberSlug → current profileSha
  counter: number;
}

const G = globalThis as { __waicMockRsvpStore?: MockRsvpShared };

function shared(): MockRsvpShared {
  if (!G.__waicMockRsvpStore) {
    G.__waicMockRsvpStore = { state: new Map(), sha: new Map(), counter: 0 };
  }
  return G.__waicMockRsvpStore;
}

function nextSha(): string {
  const s = shared();
  s.counter += 1;
  return `mockrsvpsha-${s.counter}`;
}

function curSha(slug: string): string {
  const s = shared();
  if (!s.sha.has(slug)) s.sha.set(slug, nextSha());
  return s.sha.get(slug) as string;
}

async function resolveAuthState(): Promise<
  | { ok: true; slug: string }
  | { ok: false; error: "not_authenticated" | "not_a_member" }
> {
  const session = await auth();
  if (!session?.githubHandle) return { ok: false, error: "not_authenticated" };
  const member = findMemberByHandle(session.githubHandle);
  if (!member) return { ok: false, error: "not_a_member" };
  return { ok: true, slug: member.slug };
}

export type MockRsvpResult =
  | { ok: true; state: "going" | "interested" | "none" }
  | { ok: false; error: string };

export const mockRsvpActions = {
  async toggle(input: {
    eventSlug: string;
    desiredState: "going" | "interested" | "none";
    profileSha: string;
  }): Promise<MockRsvpResult> {
    const a = await resolveAuthState();
    if (!a.ok) return { ok: false, error: a.error };
    if (input.profileSha !== curSha(a.slug)) {
      return { ok: false, error: "refresh_needed" };
    }
    shared().state.set(`${a.slug}:${input.eventSlug}`, input.desiredState);
    shared().sha.set(a.slug, nextSha());
    return { ok: true, state: input.desiredState };
  },

  async getState(
    eventSlug: string,
  ): Promise<{ state: "going" | "interested" | "none"; profileSha: string } | null> {
    const a = await resolveAuthState();
    if (!a.ok) return null;
    return {
      state: shared().state.get(`${a.slug}:${eventSlug}`) ?? "none",
      profileSha: curSha(a.slug),
    };
  },

  /** Test-only: clear the store between Playwright runs. */
  reset(): void {
    const s = shared();
    s.state.clear();
    s.sha.clear();
    s.counter = 0;
  },
};

export function isE2EMode(): boolean {
  return process.env.NEXT_PUBLIC_E2E_MODE === "1";
}
