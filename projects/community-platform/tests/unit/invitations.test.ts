import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  canonicalJson,
  mintToken,
  verifyToken,
  InvitePayloadSchema,
  RedeemFormSchema,
  parseInvitationsLedger,
  appendRedemptionRow,
  appendRevocationRow,
  jtiHasFinalRow,
  logRedemptionEvent,
  redeemInvitation,
} from "@/lib/invitations";
import type { InvitePayload } from "@/lib/invitations";

const TEST_SECRET = "test-secret-do-not-use-in-prod";

function validPayload(overrides: Partial<InvitePayload> = {}): InvitePayload {
  return {
    jti: "11111111-2222-4333-8444-555555555555",
    iss: "anton1rsod",
    exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    ...overrides,
  };
}

describe("canonicalJson", () => {
  it("emits compact JSON with no whitespace", () => {
    expect(canonicalJson({ a: 1, b: 2 })).toBe(`{"a":1,"b":2}`);
  });
  it("sorts object keys alphabetically (sign + verify must agree)", () => {
    expect(canonicalJson({ b: 2, a: 1 })).toBe(`{"a":1,"b":2}`);
  });
  it("omits undefined values (so optional payload fields don't differ)", () => {
    expect(canonicalJson({ a: 1, b: undefined, c: 3 })).toBe(`{"a":1,"c":3}`);
  });
  it("preserves explicit null", () => {
    expect(canonicalJson({ a: null })).toBe(`{"a":null}`);
  });
  it("handles nested objects deterministically", () => {
    expect(canonicalJson({ outer: { z: 1, a: 2 } })).toBe(
      `{"outer":{"a":2,"z":1}}`,
    );
  });
  it("escapes strings via JSON.stringify rules", () => {
    expect(canonicalJson({ s: 'he said "hi"' })).toBe(`{"s":"he said \\"hi\\""}`);
  });
});

describe("InvitePayloadSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(InvitePayloadSchema.parse(validPayload())).toEqual(validPayload());
  });
  it("rejects non-uuid jti", () => {
    expect(() =>
      InvitePayloadSchema.parse({ ...validPayload(), jti: "not-a-uuid" }),
    ).toThrow();
  });
  it("rejects negative exp", () => {
    expect(() =>
      InvitePayloadSchema.parse({ ...validPayload(), exp: -1 }),
    ).toThrow();
  });
  it("rejects iss with disallowed characters", () => {
    expect(() =>
      InvitePayloadSchema.parse({ ...validPayload(), iss: "bad handle!" }),
    ).toThrow();
  });
  it("accepts optional hint_telegram with @ prefix", () => {
    expect(
      InvitePayloadSchema.parse({
        ...validPayload(),
        hint_telegram: "@antonsafronov",
      }).hint_telegram,
    ).toBe("@antonsafronov");
  });
  it("rejects hint_telegram missing the @ prefix", () => {
    expect(() =>
      InvitePayloadSchema.parse({
        ...validPayload(),
        hint_telegram: "antonsafronov",
      }),
    ).toThrow();
  });
});

describe("H1: mintToken + verifyToken — HMAC-SHA-256 + canonical-JSON + timing-safe", () => {
  it("mintToken returns a base64url.base64url string", () => {
    const tok = mintToken(validPayload(), TEST_SECRET);
    expect(tok).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });
  it("verifyToken returns the original payload when signature + exp valid", () => {
    const p = validPayload();
    const tok = mintToken(p, TEST_SECRET);
    expect(verifyToken(tok, TEST_SECRET)).toEqual(p);
  });
  it("verifyToken returns null for tampered payload (signature mismatch)", () => {
    const tok = mintToken(validPayload(), TEST_SECRET);
    const [, sig] = tok.split(".");
    const tampered = Buffer.from(`{"jti":"11111111-2222-4333-8444-555555555555","iss":"attacker","exp":${Math.floor(Date.now() / 1000) + 7 * 86400}}`).toString("base64url");
    expect(verifyToken(`${tampered}.${sig}`, TEST_SECRET)).toBeNull();
  });
  it("verifyToken returns null for wrong secret", () => {
    const tok = mintToken(validPayload(), TEST_SECRET);
    expect(verifyToken(tok, "wrong-secret")).toBeNull();
  });
  it("verifyToken returns null for expired token", () => {
    const expired = validPayload({ exp: Math.floor(Date.now() / 1000) - 1 });
    const tok = mintToken(expired, TEST_SECRET);
    expect(verifyToken(tok, TEST_SECRET)).toBeNull();
  });
  it("verifyToken returns null for malformed string (no dot)", () => {
    expect(verifyToken("notatoken", TEST_SECRET)).toBeNull();
  });
  it("verifyToken returns null for invalid base64url payload", () => {
    expect(verifyToken("!!!.deadbeef", TEST_SECRET)).toBeNull();
  });
  it("verifyToken returns null for non-JSON payload", () => {
    const garbage = Buffer.from("not json").toString("base64url");
    expect(verifyToken(`${garbage}.deadbeef`, TEST_SECRET)).toBeNull();
  });
  it("verifyToken returns null for non-JSON payload with valid signature", async () => {
    const { createHmac } = await import("node:crypto");
    const garbage = Buffer.from("not json").toString("base64url");
    const sig = createHmac("sha256", TEST_SECRET).update(garbage).digest("base64url");
    expect(verifyToken(`${garbage}.${sig}`, TEST_SECRET)).toBeNull();
  });
  it("verifyToken returns null when payload fails Zod (missing field)", async () => {
    const { createHmac } = await import("node:crypto");
    const badPayload = `{"iss":"anton1rsod","exp":${Math.floor(Date.now() / 1000) + 60}}`;
    const b64 = Buffer.from(badPayload).toString("base64url");
    const sig = createHmac("sha256", TEST_SECRET).update(b64).digest("base64url");
    expect(verifyToken(`${b64}.${sig}`, TEST_SECRET)).toBeNull();
  });
  it("uses constant-time comparison — flipping any sig byte fails verification", () => {
    const tok = mintToken(validPayload(), TEST_SECRET);
    const dot = tok.indexOf(".");
    const b64 = tok.slice(0, dot);
    const sig = tok.slice(dot + 1);

    const sigBytes = Buffer.from(sig, "base64url");
    sigBytes.writeUInt8(sigBytes.readUInt8(0) ^ 0xff, 0);
    expect(
      verifyToken(`${b64}.${sigBytes.toString("base64url")}`, TEST_SECRET),
    ).toBeNull();

    const sigBytes2 = Buffer.from(sig, "base64url");
    const lastIdx = sigBytes2.length - 1;
    sigBytes2.writeUInt8(sigBytes2.readUInt8(lastIdx) ^ 0xff, lastIdx);
    expect(
      verifyToken(`${b64}.${sigBytes2.toString("base64url")}`, TEST_SECRET),
    ).toBeNull();
  });
});

describe("H8: RedeemFormSchema — Zod whitelist (mass-assignment defense)", () => {
  it("accepts the minimal-valid set", () => {
    const result = RedeemFormSchema.safeParse({
      display_name: "Anton Safronov",
      telegram: "@antonsafronov",
      git_email_alias: "anton@rsod.solutions",
      consent_accepted: true,
    });
    expect(result.success).toBe(true);
  });
  it("strips unknown fields (Zod default — no passthrough)", () => {
    const result = RedeemFormSchema.parse({
      display_name: "A",
      telegram: "@antonsafronov",
      git_email_alias: "a@b.com",
      consent_accepted: true,
      role: "admin",
      githubHandle: "spoofed",
    } as never);
    expect("role" in result).toBe(false);
    expect("githubHandle" in result).toBe(false);
  });
  it("rejects when consent_accepted is missing", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "A",
        telegram: "@antonsafronov",
        git_email_alias: "a@b.com",
      }).success,
    ).toBe(false);
  });
  it("rejects when consent_accepted is false", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "A",
        telegram: "@antonsafronov",
        git_email_alias: "a@b.com",
        consent_accepted: false,
      }).success,
    ).toBe(false);
  });
  it("trims display_name; rejects empty after trim", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "    ",
        telegram: "@antonsafronov",
        git_email_alias: "a@b.com",
        consent_accepted: true,
      }).success,
    ).toBe(false);
  });
  it("rejects display_name > 80 chars", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "x".repeat(81),
        telegram: "@antonsafronov",
        git_email_alias: "a@b.com",
        consent_accepted: true,
      }).success,
    ).toBe(false);
  });
  it("rejects telegram missing @", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "A",
        telegram: "antonsafronov",
        git_email_alias: "a@b.com",
        consent_accepted: true,
      }).success,
    ).toBe(false);
  });
  it("rejects malformed git_email_alias", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "A",
        telegram: "@antonsafronov",
        git_email_alias: "not-an-email",
        consent_accepted: true,
      }).success,
    ).toBe(false);
  });
  it("preserves git_email_alias case (NOT lowercased)", () => {
    const result = RedeemFormSchema.parse({
      display_name: "A",
      telegram: "@antonsafronov",
      git_email_alias: "Anton@RSOD.solutions",
      consent_accepted: true,
    });
    expect(result.git_email_alias).toBe("Anton@RSOD.solutions");
  });
});

describe("H9: RedeemFormSchema link — URL syntax + ^https:// check", () => {
  it("accepts a valid https URL", () => {
    const result = RedeemFormSchema.safeParse({
      display_name: "A",
      telegram: "@antonsafronov",
      git_email_alias: "a@b.com",
      consent_accepted: true,
      link: "https://www.linkedin.com/in/foo/",
    });
    expect(result.success).toBe(true);
  });
  it("treats empty-string link as undefined (optional)", () => {
    const result = RedeemFormSchema.parse({
      display_name: "A",
      telegram: "@antonsafronov",
      git_email_alias: "a@b.com",
      consent_accepted: true,
      link: "",
    });
    expect(result.link).toBeUndefined();
  });
  it("rejects http:// links (must be https)", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "A",
        telegram: "@antonsafronov",
        git_email_alias: "a@b.com",
        consent_accepted: true,
        link: "http://example.com",
      }).success,
    ).toBe(false);
  });
  it("rejects non-URL link strings", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "A",
        telegram: "@antonsafronov",
        git_email_alias: "a@b.com",
        consent_accepted: true,
        link: "not a url",
      }).success,
    ).toBe(false);
  });
  it("rejects link > 200 chars", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "A",
        telegram: "@antonsafronov",
        git_email_alias: "a@b.com",
        consent_accepted: true,
        link: `https://example.com/${"x".repeat(190)}`,
      }).success,
    ).toBe(false);
  });
});

describe("H10: RedeemFormSchema — newline rejection on display_name + focus", () => {
  it("rejects \\n in display_name", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "Anton\nInjection",
        telegram: "@antonsafronov",
        git_email_alias: "a@b.com",
        consent_accepted: true,
      }).success,
    ).toBe(false);
  });
  it("rejects \\r in display_name", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "Anton\rSafronov",
        telegram: "@antonsafronov",
        git_email_alias: "a@b.com",
        consent_accepted: true,
      }).success,
    ).toBe(false);
  });
  it("rejects \\n in focus", () => {
    expect(
      RedeemFormSchema.safeParse({
        display_name: "A",
        telegram: "@antonsafronov",
        git_email_alias: "a@b.com",
        consent_accepted: true,
        focus: "Frontend\nNewline",
      }).success,
    ).toBe(false);
  });
  it("treats empty-string focus as undefined", () => {
    const result = RedeemFormSchema.parse({
      display_name: "A",
      telegram: "@antonsafronov",
      git_email_alias: "a@b.com",
      consent_accepted: true,
      focus: "",
    });
    expect(result.focus).toBeUndefined();
  });
});

const EMPTY_LEDGER = `# Invitations Ledger

Append-only audit trail of personal invitations. Rows are NEVER edited or deleted.

| JTI | Status | Issued At | Issued By | Hint (Telegram) | Redeemed At | Redeemed By | Notes |
|---|---|---|---|---|---|---|---|
`;

describe("parseInvitationsLedger", () => {
  it("returns empty array for the seeded empty ledger", () => {
    expect(parseInvitationsLedger(EMPTY_LEDGER)).toEqual([]);
  });
  it("parses a single redeemed row", () => {
    const md =
      EMPTY_LEDGER +
      `| 11111111-2222-4333-8444-555555555555 | redeemed | 2026-05-01T10:00:00.000Z | @anton1rsod | @antonsafronov | 2026-05-01T11:00:00.000Z | @newmember |  |\n`;
    const rows = parseInvitationsLedger(md);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.jti).toBe("11111111-2222-4333-8444-555555555555");
    expect(rows[0]?.status).toBe("redeemed");
    expect(rows[0]?.redeemedBy).toBe("@newmember");
  });
  it("parses a revoked row (empty Redeemed cells)", () => {
    const md =
      EMPTY_LEDGER +
      `| 22222222-2222-4222-8222-222222222222 | revoked | 2026-05-02T00:00:00.000Z | @anton1rsod | @badactor |  |  | revoked by @anton1rsod (suspected leak) |\n`;
    const rows = parseInvitationsLedger(md);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("revoked");
    expect(rows[0]?.redeemedAt).toBe("");
    expect(rows[0]?.notes).toMatch(/suspected leak/);
  });
});

describe("H2 + H3: jtiHasFinalRow — replay + revocation defense", () => {
  it("returns false for empty ledger", () => {
    const rows = parseInvitationsLedger(EMPTY_LEDGER);
    expect(jtiHasFinalRow(rows, "11111111-2222-4333-8444-555555555555")).toBe(
      false,
    );
  });
  it("returns true when JTI has a redeemed row (H2)", () => {
    const md =
      EMPTY_LEDGER +
      `| 11111111-2222-4333-8444-555555555555 | redeemed | 2026-05-01T10:00:00.000Z | @anton1rsod |  | 2026-05-01T11:00:00.000Z | @newmember |  |\n`;
    expect(
      jtiHasFinalRow(
        parseInvitationsLedger(md),
        "11111111-2222-4333-8444-555555555555",
      ),
    ).toBe(true);
  });
  it("returns true when JTI has a revoked row (H3)", () => {
    const md =
      EMPTY_LEDGER +
      `| 11111111-2222-4333-8444-555555555555 | revoked | 2026-05-01T10:00:00.000Z | @anton1rsod |  |  |  | revoked |\n`;
    expect(
      jtiHasFinalRow(
        parseInvitationsLedger(md),
        "11111111-2222-4333-8444-555555555555",
      ),
    ).toBe(true);
  });
});

describe("appendRedemptionRow — snapshot-as-contract", () => {
  it("appends a row to an empty ledger (snapshot)", () => {
    const out = appendRedemptionRow(EMPTY_LEDGER, {
      jti: "11111111-2222-4333-8444-555555555555",
      issuedAt: "2026-05-01T10:00:00.000Z",
      issuedBy: "@anton1rsod",
      hintTelegram: "@antonsafronov",
      redeemedAt: "2026-05-01T11:00:00.000Z",
      redeemedBy: "@newmember",
    });
    expect(out).toMatchSnapshot();
  });
  it("escapes pipes in notes", () => {
    const out = appendRedemptionRow(EMPTY_LEDGER, {
      jti: "11111111-2222-4333-8444-555555555555",
      issuedAt: "2026-05-01T10:00:00.000Z",
      issuedBy: "@anton1rsod",
      hintTelegram: "",
      redeemedAt: "2026-05-01T11:00:00.000Z",
      redeemedBy: "@newmember",
      notes: "weird | content",
    });
    expect(out).toContain("weird &#124; content");
  });
});

describe("appendRevocationRow — snapshot", () => {
  it("appends a revocation row (snapshot)", () => {
    const out = appendRevocationRow(EMPTY_LEDGER, {
      jti: "22222222-2222-4222-8222-222222222222",
      issuedAt: "2026-05-02T00:00:00.000Z",
      issuedBy: "@anton1rsod",
      hintTelegram: "@badactor",
      revokedBy: "@anton1rsod",
      reason: "suspected leak",
    });
    expect(out).toMatchSnapshot();
  });
});

describe("H7: logRedemptionEvent — whitelist + never emits secrets", () => {
  let consoleLog: ReturnType<typeof vi.spyOn>;
  let consoleWarn: ReturnType<typeof vi.spyOn>;
  let consoleError: ReturnType<typeof vi.spyOn>;
  const noop = (): void => undefined;
  beforeEach(() => {
    consoleLog = vi.spyOn(console, "log").mockImplementation(noop);
    consoleWarn = vi.spyOn(console, "warn").mockImplementation(noop);
    consoleError = vi.spyOn(console, "error").mockImplementation(noop);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits a single line with whitelisted fields", () => {
    logRedemptionEvent({
      jti: "11111111-2222-4333-8444-555555555555",
      event: "redeemed",
      redeemerGh: "newmember",
      issuerGh: "anton1rsod",
      isoTimestamp: "2026-05-01T11:00:00.000Z",
      httpStatus: 302,
    });
    expect(consoleLog).toHaveBeenCalledTimes(1);
    const arg = consoleLog.mock.calls[0]?.[0] as string;
    expect(arg).toContain("redeemed");
    expect(arg).toContain("anton1rsod");
  });

  it("never emits the token string in any console method", () => {
    const dangerousToken = "REDACTME-PAYLOAD.REDACTME-SIG";
    logRedemptionEvent({
      jti: "11111111-2222-4333-8444-555555555555",
      event: "invalid",
      ...({ token: dangerousToken } as Record<string, unknown>),
    } as Parameters<typeof logRedemptionEvent>[0]);
    for (const spy of [consoleLog, consoleWarn, consoleError]) {
      const allLines = spy.mock.calls.map((c) => JSON.stringify(c)).join("\n");
      expect(allLines).not.toContain(dangerousToken);
    }
  });

  it("never emits INVITE_SECRET-shaped strings", () => {
    process.env.INVITE_SECRET = "supersecret-32-bytes-of-entropy-1234";
    logRedemptionEvent({
      jti: "11111111-2222-4333-8444-555555555555",
      event: "minted",
    });
    for (const spy of [consoleLog, consoleWarn, consoleError]) {
      const allLines = spy.mock.calls.map((c) => JSON.stringify(c)).join("\n");
      expect(allLines).not.toContain("supersecret-32-bytes-of-entropy-1234");
    }
  });

  it("does not throw on a minimal valid event", () => {
    expect(() =>
      logRedemptionEvent({
        jti: "11111111-2222-4333-8444-555555555555",
        event: "redeemed",
      }),
    ).not.toThrow();
  });

  it("never emits form-supplied PII (display_name, telegram, email)", () => {
    logRedemptionEvent({
      jti: "11111111-2222-4333-8444-555555555555",
      event: "redeemed",
      ...({
        display_name: "Łukasz Świątek",
        telegram_handle: "@lukasz",
        git_email_alias: "lukasz@example.com",
      } as Record<string, unknown>),
    } as Parameters<typeof logRedemptionEvent>[0]);
    for (const spy of [consoleLog, consoleWarn, consoleError]) {
      const allLines = spy.mock.calls.map((c) => JSON.stringify(c)).join("\n");
      expect(allLines).not.toContain("Łukasz");
      expect(allLines).not.toContain("@lukasz");
      expect(allLines).not.toContain("lukasz@example.com");
    }
  });
});

// Fixtures for redeemInvitation tests. ROSTER_BEFORE_MIGRATION and
// ALIASES_BEFORE were declared inside other describe blocks in
// tests/unit/roster.test.ts and tests/unit/git-email-aliases.test.ts.
// Redeclared here under RI_ prefix (Redeem Invitation) to avoid
// shadowing or cross-file imports.
const RI_ROSTER_BEFORE = `# Member Roster

**Count:** 1

## Core organizers

| Name | GitHub | Role | Telegram | Focus |
|---|---|---|---|---|
| Anton Safronov | @anton1rsod | Founder / BDFL | @antonsafronov | Direction |

## Members (opt-in)

| Name | GitHub | Telegram | Link | Focus |
|---|---|---|---|---|
| Mark Spasonov | @markspas |  | https://example.com | RevOps |

## Notes

- N/A
`;

const RI_ALIASES_BEFORE = `# Git email aliases

| Git email | GitHub handle | Notes |
|---|---|---|
| anton@rsod.solutions | anton1rsod | Founder |

## Format rules

- Header row must contain \`Git email\` and \`GitHub handle\` (case-insensitive).
`;

interface MockClient {
  readFile: ReturnType<typeof vi.fn>;
  commitMultipleFiles: ReturnType<typeof vi.fn>;
  getHeadSha: ReturnType<typeof vi.fn>;
}

function makeMockClient(): MockClient {
  return {
    readFile: vi.fn(),
    commitMultipleFiles: vi.fn(),
    getHeadSha: vi.fn().mockResolvedValue("headSha-001"),
  };
}

const happyTokenPayload: InvitePayload = {
  jti: "11111111-2222-4333-8444-555555555555",
  iss: "anton1rsod",
  exp: Math.floor(Date.now() / 1000) + 7 * 86400,
  hint_telegram: "@antonsafronov",
};

describe("redeemInvitation — happy path", () => {
  it("commits 4 files atomically and returns success", async () => {
    const client = makeMockClient();
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md")) {
        return { content: EMPTY_LEDGER, sha: "ledgerSha", path };
      }
      if (path.endsWith("roster.md")) {
        return { content: RI_ROSTER_BEFORE, sha: "rosterSha", path };
      }
      if (path.endsWith("git-email-aliases.md")) {
        return { content: RI_ALIASES_BEFORE, sha: "aliasSha", path };
      }
      return null;
    });
    client.commitMultipleFiles.mockResolvedValue({ commitSha: "newCommitSha" });

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New Member",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date("2026-05-01T11:00:00.000Z"),
    });

    expect(result.ok).toBe(true);
    expect(client.commitMultipleFiles).toHaveBeenCalledTimes(1);
    const args = client.commitMultipleFiles.mock.calls[0]?.[0] as {
      files: { path: string; content: string }[];
      message: string;
      expectedHeadSha: string;
    };
    expect(args.files).toHaveLength(4);
    expect(args.files.map((f) => f.path)).toEqual([
      "community/members/roster.md",
      "community/members/git-email-aliases.md",
      "community/members/invitations.md",
      "community/members/new-member.md",
    ]);
    expect(args.expectedHeadSha).toBe("headSha-001");
    expect(args.message).toContain("invitation: redeem invite for @newmember");
    expect(args.message).toContain("Invited-By: @anton1rsod");
    expect(args.message).toContain("Invitation-JTI: 11111111-");
    expect(args.message).toContain("Invitation-Hint-Telegram: @antonsafronov");
  });
});

describe("H2: redeemInvitation — JTI replay defense", () => {
  it("returns { ok: false } when JTI is in the ledger", async () => {
    const client = makeMockClient();
    const ledgerWithJti =
      EMPTY_LEDGER +
      `| 11111111-2222-4333-8444-555555555555 | redeemed | 2026-05-01T10:00:00.000Z | @anton1rsod |  | 2026-05-01T10:30:00.000Z | @prior |  |\n`;
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md")) {
        return { content: ledgerWithJti, sha: "ledgerSha", path };
      }
      return null;
    });

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });

    expect(result.ok).toBe(false);
    expect(client.commitMultipleFiles).not.toHaveBeenCalled();
  });
});

describe("H3: redeemInvitation — revocation defense", () => {
  it("returns { ok: false } when JTI has a revoked row", async () => {
    const client = makeMockClient();
    const ledgerWithRevocation =
      EMPTY_LEDGER +
      `| 11111111-2222-4333-8444-555555555555 | revoked | 2026-05-01T10:00:00.000Z | @anton1rsod |  |  |  | revoked by @anton1rsod |\n`;
    client.readFile.mockImplementation(async (path: string) =>
      path.endsWith("invitations.md")
        ? { content: ledgerWithRevocation, sha: "x", path }
        : null,
    );

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });
    expect(result.ok).toBe(false);
    expect(client.commitMultipleFiles).not.toHaveBeenCalled();
  });
});

describe("H12: redeemInvitation — slug collision + reserved", () => {
  it("uses <slug>-2 when display_name slugifies to a reserved slug", async () => {
    const client = makeMockClient();
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md"))
        return { content: EMPTY_LEDGER, sha: "x", path };
      if (path.endsWith("roster.md"))
        return { content: RI_ROSTER_BEFORE, sha: "x", path };
      if (path.endsWith("git-email-aliases.md"))
        return { content: RI_ALIASES_BEFORE, sha: "x", path };
      return null;
    });
    client.commitMultipleFiles.mockResolvedValue({ commitSha: "newCommitSha" });

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "x",
      form: {
        display_name: "Invitations",
        telegram: "@xxxxx",
        git_email_alias: "x@y.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });

    expect(result.ok).toBe(true);
    const args = client.commitMultipleFiles.mock.calls[0]?.[0] as {
      files: { path: string; content: string }[];
    };
    const profilePath = args.files.find((f) => {
      const last = f.path.split("/").pop() ?? "";
      return (
        last.endsWith(".md") &&
        !["roster.md", "git-email-aliases.md", "invitations.md"].includes(last)
      );
    })?.path;
    expect(profilePath).toBe("community/members/invitations-2.md");
  });
});

describe("H13: redeemInvitation — retry-once on 409", () => {
  it("retries exactly once when first commit fails with sha_conflict", async () => {
    const client = makeMockClient();
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md"))
        return { content: EMPTY_LEDGER, sha: "x", path };
      if (path.endsWith("roster.md"))
        return { content: RI_ROSTER_BEFORE, sha: "x", path };
      if (path.endsWith("git-email-aliases.md"))
        return { content: RI_ALIASES_BEFORE, sha: "x", path };
      return null;
    });
    let calls = 0;
    client.commitMultipleFiles.mockImplementation(async () => {
      calls += 1;
      if (calls === 1) {
        const e = new Error("sha conflict") as Error & { kind: string };
        e.kind = "sha_conflict";
        throw e;
      }
      return { commitSha: "newCommitSha" };
    });
    client.getHeadSha
      .mockResolvedValueOnce("headSha-001")
      .mockResolvedValueOnce("headSha-002");

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });
    expect(result.ok).toBe(true);
    expect(client.commitMultipleFiles).toHaveBeenCalledTimes(2);
  });

  it("aborts after second 409 (cap at 1 retry)", async () => {
    const client = makeMockClient();
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md"))
        return { content: EMPTY_LEDGER, sha: "x", path };
      if (path.endsWith("roster.md"))
        return { content: RI_ROSTER_BEFORE, sha: "x", path };
      if (path.endsWith("git-email-aliases.md"))
        return { content: RI_ALIASES_BEFORE, sha: "x", path };
      return null;
    });
    client.commitMultipleFiles.mockImplementation(async () => {
      const e = new Error("sha conflict") as Error & { kind: string };
      e.kind = "sha_conflict";
      throw e;
    });

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });
    expect(result.ok).toBe(false);
    expect(client.commitMultipleFiles).toHaveBeenCalledTimes(2);
  });

  it("aborts on retry when re-read ledger now contains the JTI (replayed-after-409)", async () => {
    const client = makeMockClient();
    const ledgerWithJti =
      EMPTY_LEDGER +
      `| 11111111-2222-4333-8444-555555555555 | redeemed | 2026-05-01T10:00:00.000Z | @anton1rsod |  | 2026-05-01T10:30:00.000Z | @racer |  |\n`;
    let ledgerReadCount = 0;
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md")) {
        ledgerReadCount += 1;
        // First read (pre-commit) returns empty so initial JTI check passes;
        // second read (retry path) returns a ledger with the JTI present.
        const content = ledgerReadCount === 1 ? EMPTY_LEDGER : ledgerWithJti;
        return { content, sha: "x", path };
      }
      if (path.endsWith("roster.md"))
        return { content: RI_ROSTER_BEFORE, sha: "x", path };
      if (path.endsWith("git-email-aliases.md"))
        return { content: RI_ALIASES_BEFORE, sha: "x", path };
      return null;
    });
    client.commitMultipleFiles.mockImplementation(async () => {
      const e = new Error("sha conflict") as Error & { kind: string };
      e.kind = "sha_conflict";
      throw e;
    });

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });
    expect(result.ok).toBe(false);
    // First commit attempt (sha_conflict) happened, but the retry was
    // short-circuited by the replay check — no second commit.
    expect(client.commitMultipleFiles).toHaveBeenCalledTimes(1);
    // Re-read of the ledger happened at least twice: once at start, once on retry.
    expect(ledgerReadCount).toBeGreaterThanOrEqual(2);
  });
});

describe("redeemInvitation — defensive error paths", () => {
  it("returns { ok: false } when ledger readFile returns null", async () => {
    const client = makeMockClient();
    client.readFile.mockImplementation(async () => null);

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });
    expect(result.ok).toBe(false);
    expect(client.commitMultipleFiles).not.toHaveBeenCalled();
  });

  it("returns { ok: false } when nextAvailableSlug exceeds the 9-suffix cap", async () => {
    const client = makeMockClient();
    // display_name "Foo" → slug "foo". Make foo.md, foo-2.md, ..., foo-9.md
    // all exist (return non-null) so nextAvailableSlug throws.
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md"))
        return { content: EMPTY_LEDGER, sha: "x", path };
      // Member-profile probe: every "foo*" path returns non-null to force
      // the slug helper past its -9 cap.
      const fileName = path.split("/").pop() ?? "";
      if (/^foo(-[2-9])?\.md$/.test(fileName)) {
        return { content: "existing profile", sha: "x", path };
      }
      // Roster + aliases would normally read here, but slug failure short-circuits.
      return null;
    });
    // Use a payload WITHOUT hint_telegram to also exercise the
    // `(payload.hint_telegram ? ... : "")` empty-branch in the commit message
    // builder (line 496). Even though we never reach commit here on slug
    // failure, including this case keeps the suite faithful to that branch.
    const noHintPayload: InvitePayload = {
      jti: "11111111-2222-4333-8444-555555555555",
      iss: "anton1rsod",
      exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    };

    const result = await redeemInvitation({
      payload: noHintPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "Foo",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });
    expect(result.ok).toBe(false);
    expect(client.commitMultipleFiles).not.toHaveBeenCalled();
  });

  it("returns { ok: false } when roster readFile returns null", async () => {
    const client = makeMockClient();
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md"))
        return { content: EMPTY_LEDGER, sha: "x", path };
      // Slug probe (member profile) misses → resolves to base slug.
      // Roster missing → defensive bail.
      if (path.endsWith("roster.md")) return null;
      if (path.endsWith("git-email-aliases.md"))
        return { content: RI_ALIASES_BEFORE, sha: "x", path };
      return null;
    });

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New Member",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });
    expect(result.ok).toBe(false);
    expect(client.commitMultipleFiles).not.toHaveBeenCalled();
  });

  it("returns { ok: false } when aliases readFile returns null", async () => {
    const client = makeMockClient();
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md"))
        return { content: EMPTY_LEDGER, sha: "x", path };
      if (path.endsWith("roster.md"))
        return { content: RI_ROSTER_BEFORE, sha: "x", path };
      if (path.endsWith("git-email-aliases.md")) return null;
      return null;
    });

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New Member",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });
    expect(result.ok).toBe(false);
    expect(client.commitMultipleFiles).not.toHaveBeenCalled();
  });

  it("returns { ok: false } when appendAlias throws (duplicate-email bail)", async () => {
    const client = makeMockClient();
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md"))
        return { content: EMPTY_LEDGER, sha: "x", path };
      if (path.endsWith("roster.md"))
        return { content: RI_ROSTER_BEFORE, sha: "x", path };
      if (path.endsWith("git-email-aliases.md"))
        return { content: RI_ALIASES_BEFORE, sha: "x", path };
      return null;
    });

    // RI_ALIASES_BEFORE already has anton@rsod.solutions; pass it again.
    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New Member",
        telegram: "@newmember",
        git_email_alias: "anton@rsod.solutions",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });
    expect(result.ok).toBe(false);
    expect(client.commitMultipleFiles).not.toHaveBeenCalled();
  });

  it("commits successfully with no hint_telegram (covers `hint_telegram ?? \"\"` + commit-message ternary empty branches)", async () => {
    const client = makeMockClient();
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md"))
        return { content: EMPTY_LEDGER, sha: "x", path };
      if (path.endsWith("roster.md"))
        return { content: RI_ROSTER_BEFORE, sha: "x", path };
      if (path.endsWith("git-email-aliases.md"))
        return { content: RI_ALIASES_BEFORE, sha: "x", path };
      return null;
    });
    client.commitMultipleFiles.mockResolvedValue({ commitSha: "newCommitSha" });

    const noHintPayload: InvitePayload = {
      jti: "11111111-2222-4333-8444-555555555555",
      iss: "anton1rsod",
      exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    };

    const result = await redeemInvitation({
      payload: noHintPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New Member",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date("2026-05-01T11:00:00.000Z"),
    });

    expect(result.ok).toBe(true);
    const args = client.commitMultipleFiles.mock.calls[0]?.[0] as {
      message: string;
    };
    expect(args.message).not.toContain("Invitation-Hint-Telegram");
  });

  it("returns { ok: false } when first commit fails with a non-conflict error (covers `: invalid` + `: 500` ternary branches)", async () => {
    const client = makeMockClient();
    client.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md"))
        return { content: EMPTY_LEDGER, sha: "x", path };
      if (path.endsWith("roster.md"))
        return { content: RI_ROSTER_BEFORE, sha: "x", path };
      if (path.endsWith("git-email-aliases.md"))
        return { content: RI_ALIASES_BEFORE, sha: "x", path };
      return null;
    });
    // Non-sha_conflict error → bail immediately, no retry.
    client.commitMultipleFiles.mockImplementation(async () => {
      throw new Error("network failure (no kind)");
    });

    const result = await redeemInvitation({
      payload: happyTokenPayload,
      redeemerHandle: "newmember",
      form: {
        display_name: "New Member",
        telegram: "@newmember",
        git_email_alias: "new@member.com",
        consent_accepted: true as const,
      },
      client,
      now: () => new Date(),
    });
    expect(result.ok).toBe(false);
    expect(client.commitMultipleFiles).toHaveBeenCalledTimes(1);
  });
});

describe("parseInvitationsLedger — defensive parser branches", () => {
  it("ignores rows that aren't inside the table body (lines before header)", () => {
    const content = `# Invitations Ledger

| Some other table | Foo |
|---|---|
| nope | nope |

## Section

| JTI | Status | Issued At | Issued By | Hint Telegram | Redeemed At | Redeemed By | Notes |
|---|---|---|---|---|---|---|---|
`;
    expect(parseInvitationsLedger(content)).toEqual([]);
  });

  it("skips malformed rows with fewer than 8 columns", () => {
    const content =
      EMPTY_LEDGER +
      "| jti-only | redeemed | 2026-01-01 |\n";
    expect(parseInvitationsLedger(content)).toEqual([]);
  });

  it("skips rows whose status is neither redeemed nor revoked", () => {
    const content =
      EMPTY_LEDGER +
      `| 11111111-2222-4333-8444-555555555555 | pending | 2026-05-01 | @anton |  |  |  |  |\n`;
    expect(parseInvitationsLedger(content)).toEqual([]);
  });
});

describe("appendRedemptionRow / appendRevocationRow — ledger-without-trailing-newline branch", () => {
  it("appendRedemptionRow inserts a leading newline when the input lacks one", () => {
    const trimmedLedger = EMPTY_LEDGER.replace(/\n+$/, "");
    expect(trimmedLedger.endsWith("\n")).toBe(false);
    const out = appendRedemptionRow(trimmedLedger, {
      jti: "11111111-2222-4333-8444-555555555555",
      issuedAt: "2026-05-01T10:00:00.000Z",
      issuedBy: "@anton1rsod",
      hintTelegram: "",
      redeemedAt: "2026-05-01T10:30:00.000Z",
      redeemedBy: "@newmember",
    });
    // The orchestrator's contract is "exactly one newline between body and row".
    expect(out.startsWith(trimmedLedger + "\n")).toBe(true);
    expect(out.endsWith("|\n")).toBe(true);
  });

  it("appendRevocationRow inserts a leading newline when the input lacks one", () => {
    const trimmedLedger = EMPTY_LEDGER.replace(/\n+$/, "");
    expect(trimmedLedger.endsWith("\n")).toBe(false);
    const out = appendRevocationRow(trimmedLedger, {
      jti: "11111111-2222-4333-8444-555555555555",
      issuedAt: "2026-05-01T10:00:00.000Z",
      issuedBy: "@anton1rsod",
      hintTelegram: "",
      revokedBy: "@anton1rsod",
      reason: "test",
    });
    expect(out.startsWith(trimmedLedger + "\n")).toBe(true);
    expect(out.endsWith("|\n")).toBe(true);
  });
});
