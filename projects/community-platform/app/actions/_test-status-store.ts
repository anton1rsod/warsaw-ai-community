/**
 * In-memory mock store for E2E tests. Active only when
 * `NEXT_PUBLIC_E2E_MODE === "1"`.
 *
 * Why this exists: real status writes go through the GitHub App which
 * commits to a public repo. E2E tests need a deterministic, side-effect-
 * free path. This store mirrors the action surface (post / edit / remove /
 * list) without touching GitHub.
 *
 * Excluded from coverage in vitest.config.ts because it's E2E-only — no
 * Vitest unit tests reach this file. The Playwright E2E suite exercises
 * it end-to-end.
 */

import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";

interface StoredStatus {
  body: string;
  sha: string;
}

interface MockStoreShared {
  store: Map<string, StoredStatus>;
  counter: number;
}

// State lives on globalThis because Next 16 "use server" files are bundled
// into a separate module graph from server components / route handlers.
// Without this hop, action posts and page reads land in different
// instances and Playwright sees stale state.
const G = globalThis as { __waicMockStatusStore?: MockStoreShared };

function shared(): MockStoreShared {
  if (!G.__waicMockStatusStore) {
    G.__waicMockStatusStore = { store: new Map(), counter: 0 };
  }
  return G.__waicMockStatusStore;
}

function nextSha(): string {
  const s = shared();
  s.counter += 1;
  return `mocksha-${s.counter}`;
}

function pathFor(week: string, slug: string): string {
  return `community/status/${week}/${slug}.md`;
}

/**
 * Distinguishes the two failure modes the production resolveAuthor surfaces.
 * Without this split, a Playwright test that submits an action without
 * loginAs would get back not_a_member rather than not_authenticated and
 * fail-pass on the wrong assertion.
 */
async function resolveAuthState(): Promise<
  | { ok: true; slug: string }
  | { ok: false; error: "not_authenticated" | "not_a_member" }
> {
  const session = await auth();
  if (!session?.githubHandle) {
    return { ok: false, error: "not_authenticated" };
  }
  const member = findMemberByHandle(session.githubHandle);
  if (!member) return { ok: false, error: "not_a_member" };
  return { ok: true, slug: member.slug };
}

export type MockResult =
  | { ok: true; sha: string }
  | { ok: false; error: string };

export const mockStatusActions = {
  async post(input: { week: string; body: string }): Promise<MockResult> {
    const auth = await resolveAuthState();
    if (!auth.ok) return { ok: false, error: auth.error };
    const sha = nextSha();
    shared().store.set(pathFor(input.week, auth.slug), {
      body: input.body,
      sha,
    });
    return { ok: true, sha };
  },
  async edit(input: {
    week: string;
    body: string;
    sha: string;
  }): Promise<MockResult> {
    const auth = await resolveAuthState();
    if (!auth.ok) return { ok: false, error: auth.error };
    const key = pathFor(input.week, auth.slug);
    const s = shared();
    const existing = s.store.get(key);
    // Production: GitHub returns 404 when there's no file to update.
    // Mirror that here so SHA-conflict semantics match end-to-end.
    if (!existing) return { ok: false, error: "not_found" };
    if (existing.sha !== input.sha) {
      return { ok: false, error: "sha_conflict" };
    }
    const sha = nextSha();
    s.store.set(key, { body: input.body, sha });
    return { ok: true, sha };
  },
  async remove(input: {
    week: string;
    sha: string;
  }): Promise<MockResult> {
    const auth = await resolveAuthState();
    if (!auth.ok) return { ok: false, error: auth.error };
    const key = pathFor(input.week, auth.slug);
    const s = shared();
    const existing = s.store.get(key);
    if (!existing) return { ok: false, error: "not_found" };
    if (existing.sha !== input.sha) {
      return { ok: false, error: "sha_conflict" };
    }
    s.store.delete(key);
    return { ok: true, sha: "" };
  },
  list(week: string): { slug: string; body: string; sha: string }[] {
    const prefix = `community/status/${week}/`;
    const results: { slug: string; body: string; sha: string }[] = [];
    for (const [key, value] of shared().store.entries()) {
      if (!key.startsWith(prefix)) continue;
      const slug = key.slice(prefix.length).replace(/\.md$/, "");
      results.push({ slug, body: value.body, sha: value.sha });
    }
    return results;
  },
  /** Test-only: clear the store between Playwright runs. */
  reset(): void {
    const s = shared();
    s.store.clear();
    s.counter = 0;
  },
};

export function isE2EMode(): boolean {
  return process.env.NEXT_PUBLIC_E2E_MODE === "1";
}
