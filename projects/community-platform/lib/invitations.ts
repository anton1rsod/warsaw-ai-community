import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Canonical JSON serialization for HMAC payload signing.
 *
 * Properties: alphabetically-sorted keys at every depth; `undefined`
 * values omitted; explicit `null` preserved; no whitespace. The same
 * function is called on the SIGN side and the VERIFY side so that
 * payload key order at construction time has no effect on the HMAC.
 *
 * Used by mintToken (Task 11.1.5) + verifyToken (Task 11.1.5).
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, sortKeys);
}

function sortKeys(_key: string, val: unknown): unknown {
  if (
    val === null ||
    typeof val !== "object" ||
    Array.isArray(val)
  ) {
    return val;
  }
  const obj = val as Record<string, unknown>;
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      const v = obj[k];
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {});
}

export const InvitePayloadSchema = z.object({
  jti: z.string().uuid(),
  iss: z.string().regex(/^[a-zA-Z0-9-]{1,39}$/),
  exp: z.number().int().positive(),
  hint_telegram: z
    .string()
    .regex(/^@[a-zA-Z0-9_]{5,32}$/)
    .optional(),
  hint_display_name: z.string().min(1).max(80).optional(),
});

export type InvitePayload = z.infer<typeof InvitePayloadSchema>;

/**
 * Mint an invitation token: validates payload via Zod → canonical JSON
 * → base64url-no-padding → HMAC-SHA-256 over the BASE64URL STRING →
 * format `<b64url(payload)>.<b64url(sig)>`.
 *
 * Signature scope is the base64url string (NOT raw JSON bytes) to avoid
 * padding-canonicalization ambiguity and mirror JWS conventions while
 * NOT being a JWT (no header, no `alg` field — closes alg=none class).
 *
 * H1: HMAC-SHA-256 + canonical-JSON. Tested in invitations.test.ts.
 */
export function mintToken(payload: InvitePayload, secret: string): string {
  const validated = InvitePayloadSchema.parse(payload);
  const json = canonicalJson(validated);
  const payloadB64 = Buffer.from(json, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

/**
 * Verify an invitation token. Returns the parsed payload on success;
 * null on ANY failure (malformed format, signature mismatch, JSON parse
 * error, schema invalid, expired). Single null return ensures error
 * paths don't leak which check failed (info-leak prevention §11.5).
 *
 * H1 properties:
 *  - HMAC-SHA-256 over the base64url payload string.
 *  - `crypto.timingSafeEqual` for the signature comparison
 *    (length-mismatch short-circuit is intentional — length isn't secret).
 *  - canonical-JSON shared with mintToken (via canonicalJson()).
 */
export function verifyToken(
  token: string,
  secret: string,
): InvitePayload | null {
  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);

  const expectedSig = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  if (expectedSig.length !== sigB64.length) return null;

  const aBuf = Buffer.from(expectedSig);
  const bBuf = Buffer.from(sigB64);
  if (!timingSafeEqual(aBuf, bBuf)) return null;

  const json = Buffer.from(payloadB64, "base64url").toString("utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  const result = InvitePayloadSchema.safeParse(parsed);
  if (!result.success) return null;

  if (result.data.exp < Math.floor(Date.now() / 1000)) return null;

  return result.data;
}

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const noNewlines = z.string().refine((s) => !/[\r\n]/.test(s), {
  message: "must be a single line",
});

/**
 * Server-side form validation for /onboard.
 *
 * H8 (mass-assignment defense): Zod's default behavior strips fields not
 * declared in `.object({...})` — only the listed 6 fields ever flow to
 * the orchestrator, so a posted `role=admin` or `githubHandle=spoofed`
 * is silently dropped.
 *
 * H9 (link safety): URL-syntax + .startsWith("https://") AND .max(200).
 *
 * H10 (newline rejection): display_name + focus refuse \r and \n,
 * preventing injection of new markdown table rows in the bot's commit.
 *
 * git_email_alias case is preserved (lowercase happens in
 * lib/git-email-aliases.ts:appendAlias if needed; for the alias file
 * itself, case-insensitive comparison is the rule).
 */
export const RedeemFormSchema = z.object({
  display_name: noNewlines
    .transform((s) => s.trim())
    .pipe(z.string().min(1).max(80)),
  focus: z.preprocess(
    emptyToUndef,
    noNewlines.transform((s) => s.trim()).pipe(z.string().max(120)).optional(),
  ),
  link: z.preprocess(
    emptyToUndef,
    z
      .string()
      .trim()
      .max(200)
      .url()
      .refine((s) => s.startsWith("https://"), {
        message: "link must use https://",
      })
      .optional(),
  ),
  telegram: z.string().regex(/^@[a-zA-Z0-9_]{5,32}$/),
  git_email_alias: z.string().email().max(120),
  consent_accepted: z.literal(true),
});

export type RedeemFormInput = z.infer<typeof RedeemFormSchema>;

export interface LedgerRow {
  readonly jti: string;
  readonly status: "redeemed" | "revoked";
  readonly issuedAt: string;
  readonly issuedBy: string;
  readonly hintTelegram: string;
  readonly redeemedAt: string;
  readonly redeemedBy: string;
  readonly notes: string;
}

const SEPARATOR_ROW = /^\|[\s\-|:]+\|$/;
const HEADER_FIRST_CELL = "JTI";

function parseRowCells(line: string): string[] {
  const inner = line.replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((c) => c.trim());
}

/**
 * Parse the ledger markdown into rows. Tolerates absent/extra prose;
 * locates the table by the `| JTI |` header followed by a separator
 * row. Returns [] for the seeded empty ledger.
 */
export function parseInvitationsLedger(content: string): LedgerRow[] {
  const lines = content.split("\n");
  const rows: LedgerRow[] = [];
  let inTableBody = false;
  let lastWasHeader = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith("|")) {
      inTableBody = false;
      lastWasHeader = false;
      continue;
    }
    if (SEPARATOR_ROW.test(line)) {
      if (lastWasHeader) inTableBody = true;
      lastWasHeader = false;
      continue;
    }
    const cells = parseRowCells(line);
    if (cells[0] === HEADER_FIRST_CELL) {
      lastWasHeader = true;
      continue;
    }
    if (!inTableBody) continue;
    if (cells.length < 8) continue;
    const status = cells[1];
    if (status !== "redeemed" && status !== "revoked") continue;
    rows.push({
      jti: cells[0] ?? "",
      status,
      issuedAt: cells[2] ?? "",
      issuedBy: cells[3] ?? "",
      hintTelegram: cells[4] ?? "",
      redeemedAt: cells[5] ?? "",
      redeemedBy: cells[6] ?? "",
      notes: cells[7] ?? "",
    });
  }

  return rows;
}

/**
 * H2 + H3: a JTI is "final" (verifier rejects it) when ANY row exists
 * with status redeemed or revoked. Append-only invariant: even both
 * present together still rejects.
 */
export function jtiHasFinalRow(
  rows: readonly LedgerRow[],
  jti: string,
): boolean {
  return rows.some((r) => r.jti === jti);
}

function escapeCell(s: string): string {
  return s.replaceAll("|", "&#124;");
}

export interface RedemptionRowInput {
  readonly jti: string;
  readonly issuedAt: string;
  readonly issuedBy: string;
  readonly hintTelegram: string;
  readonly redeemedAt: string;
  readonly redeemedBy: string;
  readonly notes?: string;
}

export function appendRedemptionRow(
  ledger: string,
  input: RedemptionRowInput,
): string {
  const row =
    `| ${input.jti} | redeemed | ${input.issuedAt} | ${input.issuedBy} ` +
    `| ${input.hintTelegram} | ${input.redeemedAt} | ${input.redeemedBy} ` +
    `| ${escapeCell(input.notes ?? "")} |\n`;
  return ledger.endsWith("\n") ? `${ledger}${row}` : `${ledger}\n${row}`;
}

export interface RevocationRowInput {
  readonly jti: string;
  readonly issuedAt: string;
  readonly issuedBy: string;
  readonly hintTelegram: string;
  readonly revokedBy: string;
  readonly reason: string;
}

export function appendRevocationRow(
  ledger: string,
  input: RevocationRowInput,
): string {
  const notes = `revoked by ${input.revokedBy} (${escapeCell(input.reason)})`;
  const row =
    `| ${input.jti} | revoked | ${input.issuedAt} | ${input.issuedBy} ` +
    `| ${input.hintTelegram} |  |  | ${notes} |\n`;
  return ledger.endsWith("\n") ? `${ledger}${row}` : `${ledger}\n${row}`;
}
