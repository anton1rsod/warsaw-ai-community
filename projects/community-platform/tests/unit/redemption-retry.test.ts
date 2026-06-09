import { describe, it, expect, vi } from "vitest";
import { redeemInvitation, type RedemptionClient } from "@/lib/invitations";

const LH = "# Invitations Ledger\n\n| JTI | Status | Issued At | Issued By | Hint (Telegram) | Redeemed At | Redeemed By | Notes |\n|---|---|---|---|---|---|---|---|\n";
const RO = "# Roster\n\n## Members (opt-in)\n\n| Name | GitHub | Telegram | Link | Focus |\n|---|---|---|---|---|\n";
const AL = "# Git email aliases\n\n| Git email | GitHub handle | Notes |\n|---|---|---|\n";
const FORM = { display_name: "P", focus: undefined, link: undefined, telegram: "@person", git_email_alias: "p@p.com", consent_accepted: true as const };

function conflictThenSucceed(failures: number): RedemptionClient {
  let calls = 0;
  return {
    async readFile(path) {
      if (path.endsWith("invitations.md")) return { content: LH, sha: "s", path };
      if (path.endsWith("roster.md")) return { content: RO, sha: "s", path };
      if (path.endsWith("git-email-aliases.md")) return { content: AL, sha: "s", path };
      return null;
    },
    async commitMultipleFiles() {
      calls += 1;
      if (calls <= failures) throw { kind: "sha_conflict" };
      return { commitSha: "ok" };
    },
    async getHeadSha() { return "head"; },
  };
}

describe("H129: redemption CAS retries with injected backoff", () => {
  it("retries past the old single-retry limit and eventually succeeds", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const r = await redeemInvitation({
      payload: { jti: "11111111-2222-4333-8444-555555555555", iss: "a", exp: Math.floor(Date.now()/1000)+3600 },
      redeemerHandle: "person", form: FORM, client: conflictThenSucceed(3), now: () => new Date(), sleep, rng: () => 0.5,
    });
    expect(r.ok).toBe(true);
    expect(sleep).toHaveBeenCalledTimes(3); // 3 conflicts → 3 backoff sleeps
  });
  it("gives up after MAX_ATTEMPTS conflicts", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const r = await redeemInvitation({
      payload: { jti: "22222222-2222-4333-8444-555555555555", iss: "a", exp: Math.floor(Date.now()/1000)+3600 },
      redeemerHandle: "person", form: FORM, client: conflictThenSucceed(99), now: () => new Date(), sleep, rng: () => 0,
    });
    expect(r.ok).toBe(false);
  });
});
