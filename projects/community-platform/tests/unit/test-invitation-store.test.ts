import { describe, it, expect, beforeEach } from "vitest";
import { mockInvitationStore } from "@/app/actions/_test-invitation-store";

beforeEach(() => mockInvitationStore.reset());

describe("mockInvitationStore", () => {
  it("hasRedeemed returns false initially", () => {
    expect(mockInvitationStore.hasRedeemed("missing-jti")).toBe(false);
  });

  it("hasRosterAddition returns false initially", () => {
    expect(mockInvitationStore.hasRosterAddition("@nobody")).toBe(false);
  });

  it("recordRedemption marks JTI as redeemed and handle as added", () => {
    mockInvitationStore.recordRedemption("jti-1", "@handle");
    expect(mockInvitationStore.hasRedeemed("jti-1")).toBe(true);
    expect(mockInvitationStore.hasRosterAddition("@handle")).toBe(true);
  });

  it("reset clears redeemed state", () => {
    mockInvitationStore.recordRedemption("jti-1", "@handle");
    mockInvitationStore.reset();
    expect(mockInvitationStore.hasRedeemed("jti-1")).toBe(false);
    expect(mockInvitationStore.hasRosterAddition("@handle")).toBe(false);
  });

  it("listRedeemedJtis returns all recorded JTIs (used by E2E mock readFile)", () => {
    expect(mockInvitationStore.listRedeemedJtis()).toEqual([]);
    mockInvitationStore.recordRedemption("jti-a", "@a");
    mockInvitationStore.recordRedemption("jti-b", "@b");
    expect(mockInvitationStore.listRedeemedJtis()).toEqual(
      expect.arrayContaining(["jti-a", "jti-b"]),
    );
    expect(mockInvitationStore.listRedeemedJtis()).toHaveLength(2);
  });
});
