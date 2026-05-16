/**
 * In-memory mock for profile prose state. Active only when
 * `NEXT_PUBLIC_E2E_MODE === "1"` AND `NODE_ENV !== "production"`.
 *
 * Tracks both body and a synthetic SHA for SHA-CAS conflict simulation.
 * State lives on globalThis for the Next 16 "use server" bundling split.
 */

interface ProfileEntry {
  body: string;
  sha: string;
}

interface MockProfileShared {
  profiles: Map<string, ProfileEntry>;
}

const G = globalThis as { __waicMockProfileStore?: MockProfileShared };

function shared(): MockProfileShared {
  if (!G.__waicMockProfileStore) {
    G.__waicMockProfileStore = { profiles: new Map() };
  }
  return G.__waicMockProfileStore;
}

let nextSha = 0;
function newSha(): string {
  nextSha += 1;
  return `mock-sha-${nextSha}`;
}

export const mockProfileStore = {
  get(slug: string): ProfileEntry | null {
    return shared().profiles.get(slug) ?? null;
  },
  /**
   * SHA-CAS write. Returns the new entry, OR null if expectedSha doesn't
   * match the current SHA (caller should map to sha_conflict).
   */
  write(slug: string, body: string, expectedSha: string): ProfileEntry | null {
    const current = shared().profiles.get(slug);
    if (!current) {
      // Initial seed — caller can pass any expectedSha; we accept on first write.
      const entry = { body, sha: newSha() };
      shared().profiles.set(slug, entry);
      return entry;
    }
    if (current.sha !== expectedSha) {
      return null; // CAS conflict
    }
    const entry = { body, sha: newSha() };
    shared().profiles.set(slug, entry);
    return entry;
  },
  /** Seed the store (called by /api/test-reset-profile with optional initial body). */
  seed(slug: string, body: string): ProfileEntry {
    const entry = { body, sha: newSha() };
    shared().profiles.set(slug, entry);
    return entry;
  },
  remove(slug: string): void {
    shared().profiles.delete(slug);
  },
  reset(): void {
    shared().profiles.clear();
    nextSha = 0;
  },
};
