/**
 * In-memory mock for invitation redemption state during E2E.
 *
 * Active only when NEXT_PUBLIC_E2E_MODE === "1" AND NODE_ENV !== "production".
 * Mirrors the production redemption contract: each redeem appends to roster,
 * aliases, ledger; creates a profile file. The mock represents this as
 * Sets/Maps on globalThis (matches _test-consent-store pattern).
 */
interface MockInvitationShared {
  redeemedJtis: Set<string>;
  rosterAdditions: Set<string>;
}

const G = globalThis as { __waicMockInvitationStore?: MockInvitationShared };

function shared(): MockInvitationShared {
  if (!G.__waicMockInvitationStore) {
    G.__waicMockInvitationStore = {
      redeemedJtis: new Set(),
      rosterAdditions: new Set(),
    };
  }
  return G.__waicMockInvitationStore;
}

export const mockInvitationStore = {
  hasRedeemed(jti: string): boolean {
    return shared().redeemedJtis.has(jti);
  },
  listRedeemedJtis(): readonly string[] {
    return Array.from(shared().redeemedJtis);
  },
  recordRedemption(jti: string, handle: string): void {
    shared().redeemedJtis.add(jti);
    shared().rosterAdditions.add(handle);
  },
  hasRosterAddition(handle: string): boolean {
    return shared().rosterAdditions.has(handle);
  },
  reset(): void {
    shared().redeemedJtis.clear();
    shared().rosterAdditions.clear();
  },
};
