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

import { redeemInvitation, type RedemptionClient } from "@/lib/invitations";

const LEDGER_HEADER = "# Invitations Ledger\n\n" + "| JTI | Status | Issued At | Issued By | Hint (Telegram) | Redeemed At | Redeemed By | Notes |\n|---|---|---|---|---|---|---|---|\n";
const ROSTER_EMPTY = "# Roster\n\n## Members (opt-in)\n\n| Name | GitHub | Telegram | Link | Focus |\n|---|---|---|---|---|\n";
const ALIASES_EMPTY = "# Git email aliases\n\n| Git email | GitHub handle | Notes |\n|---|---|---|\n";
const FORM = { display_name: "New Person", focus: undefined, link: undefined, telegram: "@newperson", git_email_alias: "n@p.com", consent_accepted: true as const };
const MJTI = "99999999-2222-4333-8444-555555555555";

function fakeClient(over: Partial<Record<string, string>> = {}): RedemptionClient {
  const ledger = over.ledger ?? LEDGER_HEADER;
  const roster = over.roster ?? ROSTER_EMPTY;
  return {
    async readFile(path) {
      if (path.endsWith("invitations.md")) return { content: ledger, sha: "s", path };
      if (path.endsWith("roster.md")) return { content: roster, sha: "s", path };
      if (path.endsWith("git-email-aliases.md")) return { content: ALIASES_EMPTY, sha: "s", path };
      return null; // member file absent → slug free
    },
    async commitMultipleFiles() { return { commitSha: "ok" }; },
    async getHeadSha() { return "head"; },
  };
}
const base = (client: RedemptionClient) => ({ payload: { jti: MJTI, iss: "anton1rsod", exp: Math.floor(Date.now()/1000)+3600, kind: "meeting" as const, max_uses: 2 }, redeemerHandle: "newperson", form: FORM, client, now: () => new Date() });

describe("H124/H126/H128: meeting redemption guard", () => {
  it("allows a meeting redemption when under cap and not revoked", async () => {
    const r = await redeemInvitation(base(fakeClient()));
    expect(r.ok).toBe(true);
  });
  it("rejects when the jti is revoked", async () => {
    const ledger = LEDGER_HEADER + `| ${MJTI} | revoked | i | @a | | | | x |\n`;
    const r = await redeemInvitation(base(fakeClient({ ledger })));
    expect(r.ok).toBe(false);
  });
  it("rejects when redemption count >= max_uses (soft cap)", async () => {
    const ledger = LEDGER_HEADER + `| ${MJTI} | redeemed | i | @a | | r | @x | |\n| ${MJTI} | redeemed | i | @a | | r | @y | |\n`;
    const r = await redeemInvitation(base(fakeClient({ ledger })));
    expect(r.ok).toBe(false);
  });
  it("rejects when the redeemer handle is already in the live roster (H128)", async () => {
    const roster = ROSTER_EMPTY.replace("|---|\n", "|---|\n| Existing | @newperson | | | |\n");
    const r = await redeemInvitation(base(fakeClient({ roster })));
    expect(r.ok).toBe(false);
  });
  it("a single-kind token with a prior redeemed row is still rejected (backward-compat)", async () => {
    const ledger = LEDGER_HEADER + `| ${MJTI} | redeemed | i | @a | | r | @x | |\n`;
    const r = await redeemInvitation({ ...base(fakeClient({ ledger })), payload: { jti: MJTI, iss: "anton1rsod", exp: Math.floor(Date.now()/1000)+3600 } });
    expect(r.ok).toBe(false);
  });
});
