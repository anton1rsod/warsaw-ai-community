/**
 * In-memory mock store for Thanks E2E tests. Active only when
 * NEXT_PUBLIC_E2E_MODE === "1". Backs thank-status.ts (write) and provides
 * a profileSha for the ThankButton so the /this-week page can render a
 * functional button without a real GitHub App token.
 * Coverage-excluded in vitest.config.ts — E2E-only.
 *
 * Why globalThis: Next 16 "use server" files are bundled into a separate
 * module graph from server components / route handlers. Without the hop,
 * action writes and page reads land in different instances and Playwright
 * sees stale state.
 */
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";

interface MockThankShared {
  // giverSlug → Set(`${recipient}|${item_type}|${item_id}`)
  given: Map<string, Set<string>>;
  // memberSlug → current profileSha
  sha: Map<string, string>;
  counter: number;
}

const G = globalThis as { __waicMockThankStore?: MockThankShared };

function shared(): MockThankShared {
  if (!G.__waicMockThankStore) {
    G.__waicMockThankStore = { given: new Map(), sha: new Map(), counter: 0 };
  }
  return G.__waicMockThankStore;
}

function nextSha(): string {
  const s = shared();
  s.counter += 1;
  return `mockthankssha-${s.counter}`;
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

export type MockThankResult =
  | { ok: true; already_thanked?: boolean }
  | { ok: false; error: string };

export const mockThankActions = {
  async thank(input: {
    recipient: string;
    item_type: string;
    item_id: string;
    profileSha: string;
  }): Promise<MockThankResult> {
    const a = await resolveAuthState();
    if (!a.ok) return { ok: false, error: a.error };
    if (a.slug === input.recipient) {
      return { ok: false, error: "self_thank_blocked" };
    }
    if (input.profileSha !== curSha(a.slug)) {
      return { ok: false, error: "refresh_needed" };
    }
    const key = `${input.recipient}|${input.item_type}|${input.item_id}`;
    const set = shared().given.get(a.slug) ?? new Set<string>();
    if (set.has(key)) return { ok: true, already_thanked: true };
    set.add(key);
    shared().given.set(a.slug, set);
    shared().sha.set(a.slug, nextSha());
    return { ok: true };
  },

  /**
   * Returns the current profileSha for the given member slug.
   * Used by the /this-week page in E2E mode to provide a stable, non-empty
   * sha to the ThankButton so the button can call thankStatus.
   */
  getProfileSha(slug: string): string {
    return curSha(slug);
  },

  /** Test-only: clear the store between Playwright runs. */
  reset(): void {
    const s = shared();
    s.given.clear();
    s.sha.clear();
    s.counter = 0;
  },
};

export function isE2EMode(): boolean {
  return process.env.NEXT_PUBLIC_E2E_MODE === "1";
}
