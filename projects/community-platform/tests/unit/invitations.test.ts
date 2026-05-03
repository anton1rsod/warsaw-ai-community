import { describe, it, expect } from "vitest";
import {
  canonicalJson,
  mintToken,
  verifyToken,
  InvitePayloadSchema,
  RedeemFormSchema,
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
