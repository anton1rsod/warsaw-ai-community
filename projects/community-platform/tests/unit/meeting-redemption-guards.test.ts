import { describe, it, expect } from "vitest";
import {
  parseInvitationsLedger, jtiIsRevoked, jtiRedemptionCount, clampMeetingExpirySeconds,
  MEETING_EXPIRY_MIN_SECONDS, MEETING_EXPIRY_MAX_SECONDS, MEETING_EXPIRY_DEFAULT_SECONDS,
} from "@/lib/invitations";

const HEADER = "| JTI | Status | Issued At | Issued By | Hint (Telegram) | Redeemed At | Redeemed By | Notes |\n|---|---|---|---|---|---|---|---|\n";
const row = (jti: string, status: string) => `| ${jti} | ${status} | i | @a | | r | @b | |\n`;
const JTI = "11111111-2222-4333-8444-555555555555";

describe("H124/H126: meeting ledger predicates", () => {
  it("jtiIsRevoked true iff a revoked row exists for the jti", () => {
    const rows = parseInvitationsLedger(HEADER + row(JTI, "redeemed") + row(JTI, "revoked"));
    expect(jtiIsRevoked(rows, JTI)).toBe(true);
    expect(jtiIsRevoked(rows, "other")).toBe(false);
  });
  it("jtiRedemptionCount counts only redeemed rows for the jti", () => {
    const rows = parseInvitationsLedger(HEADER + row(JTI, "redeemed") + row(JTI, "redeemed") + row(JTI, "revoked"));
    expect(jtiRedemptionCount(rows, JTI)).toBe(2);
  });
});

describe("H127: clampMeetingExpirySeconds", () => {
  it("defaults when undefined", () => { expect(clampMeetingExpirySeconds(undefined)).toBe(MEETING_EXPIRY_DEFAULT_SECONDS); });
  it("clamps below min up to min", () => { expect(clampMeetingExpirySeconds(60)).toBe(MEETING_EXPIRY_MIN_SECONDS); });
  it("clamps above max down to max", () => { expect(clampMeetingExpirySeconds(99 * 3600)).toBe(MEETING_EXPIRY_MAX_SECONDS); });
  it("passes a valid value through (floored)", () => { expect(clampMeetingExpirySeconds(3 * 3600 + 0.9)).toBe(3 * 3600); });
});
