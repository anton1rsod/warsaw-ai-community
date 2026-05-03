/**
 * In-memory mock for consent state. Active only when
 * `NEXT_PUBLIC_E2E_MODE === "1"` AND `NODE_ENV !== "production"`.
 *
 * Mirrors the production contract: a member is consented when their
 * profile file (`community/members/<slug>.md`) exists in the repo. The
 * mock represents this as a Set<slug>.
 *
 * State lives on globalThis for the same reason as the status store
 * (Next 16's "use server" bundling split — see execution-plan §9.17).
 */

interface MockConsentShared {
  consented: Set<string>;
}

const G = globalThis as { __waicMockConsentStore?: MockConsentShared };

function shared(): MockConsentShared {
  if (!G.__waicMockConsentStore) {
    G.__waicMockConsentStore = { consented: new Set() };
  }
  return G.__waicMockConsentStore;
}

export const mockConsentStore = {
  has(slug: string): boolean {
    return shared().consented.has(slug);
  },
  add(slug: string): void {
    shared().consented.add(slug);
  },
  reset(): void {
    shared().consented.clear();
  },
};
