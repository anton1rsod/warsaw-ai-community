import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";
import { generateConsentMarkdown } from "@/lib/consent-content";
import { slugify, nextAvailableSlug } from "@/lib/slug";
import { appendMember } from "@/lib/roster";
import { appendAlias } from "@/lib/git-email-aliases";

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

/**
 * Invitation cookie name. In production browsers enforce that any
 * cookie prefixed `__Secure-` MUST be set with `Secure: true`, which
 * requires HTTPS. Dev (HTTP) therefore drops the prefix and uses a
 * plain name; production keeps the prefix for the real defence.
 */
export const INVITE_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-warsaw_invite"
    : "warsaw_invite";

/**
 * H6: cookie security profile for the invitation handoff cookie.
 * HttpOnly + SameSite=Strict + Path=/onboard (so the cookie survives
 * the OAuth round-trip without bleeding to other routes) + Max-Age=86400.
 * `secure` is true only in production — must be paired with the
 * `__Secure-` prefix to satisfy browser cookie-prefix rules.
 */
export interface InviteCookieOptions {
  readonly httpOnly: true;
  readonly secure: boolean;
  readonly sameSite: "strict";
  readonly path: "/onboard";
  readonly maxAge: 86400;
}
export function inviteCookieOptions(): InviteCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/onboard",
    maxAge: 86400,
  };
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
  // Defense-in-depth (security-reviewer M1): every cell is pipe-escaped, not
  // just `notes`. `iss`/`hint_telegram`/handles already pass upstream regex
  // guards that exclude `|`, but escaping locally drops the upstream-trust
  // dependency entirely.
  const row =
    `| ${escapeCell(input.jti)} | redeemed | ${escapeCell(input.issuedAt)} | ${escapeCell(input.issuedBy)} ` +
    `| ${escapeCell(input.hintTelegram)} | ${escapeCell(input.redeemedAt)} | ${escapeCell(input.redeemedBy)} ` +
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
  // M1 defense-in-depth: pipe-escape every cell.
  const notes = `revoked by ${escapeCell(input.revokedBy)} (${escapeCell(input.reason)})`;
  const row =
    `| ${escapeCell(input.jti)} | revoked | ${escapeCell(input.issuedAt)} | ${escapeCell(input.issuedBy)} ` +
    `| ${escapeCell(input.hintTelegram)} |  |  | ${notes} |\n`;
  return ledger.endsWith("\n") ? `${ledger}${row}` : `${ledger}\n${row}`;
}

export type RedemptionEvent =
  | "minted"
  | "redeemed"
  | "revoked"
  | "invalid"
  | "expired"
  | "replayed"
  | "commit-retry"
  | "commit-success"
  | "already-member";

export interface RedemptionLogInput {
  readonly jti: string;
  readonly event: RedemptionEvent;
  readonly redeemerGh?: string;
  readonly issuerGh?: string;
  readonly isoTimestamp?: string;
  readonly httpStatus?: number;
}

/**
 * H7: whitelist-based event logger.
 *
 * Permitted fields: jti, event, redeemerGh, issuerGh, isoTimestamp, http_status.
 * Prohibited (NEVER logged): full token strings, INVITE_SECRET, OAuth
 * tokens, cookie values, form-supplied PII (display_name, telegram,
 * email, focus, link).
 *
 * The whitelist is enforced by the function signature — extra fields
 * passed via TS-bypass are dropped by destructuring. Tests assert no
 * console.{log,warn,error} emission contains forbidden strings (spec §11.5).
 *
 * console.log is the deliberate egress here — this is the ONLY production
 * site allowed to call it (per spec §11.5 H7). Inline lint-disable scopes
 * to one line.
 */
export function logRedemptionEvent(input: RedemptionLogInput): void {
  const safe = {
    jti: input.jti,
    event: input.event,
    redeemer_gh: input.redeemerGh,
    issuer_gh: input.issuerGh,
    iso_timestamp: input.isoTimestamp ?? new Date().toISOString(),
    http_status: input.httpStatus,
  };
  // eslint-disable-next-line no-console
  console.log(`[invitation] ${JSON.stringify(safe)}`);
}

export interface RedemptionClient {
  readFile(
    path: string,
  ): Promise<{ content: string; sha: string; path: string } | null>;
  commitMultipleFiles(input: {
    files: readonly { path: string; content: string }[];
    message: string;
    expectedHeadSha: string;
  }): Promise<{ commitSha: string }>;
  getHeadSha(): Promise<string>;
}

export interface RedemptionInput {
  readonly payload: InvitePayload;
  readonly redeemerHandle: string;
  readonly form: RedeemFormInput;
  readonly client: RedemptionClient;
  /** Injectable now() for deterministic tests. */
  readonly now: () => Date;
}

export type RedemptionResult =
  | { ok: true; commitSha: string }
  | { ok: false };

const ROSTER_PATH = "community/members/roster.md";
const ALIASES_PATH = "community/members/git-email-aliases.md";
const LEDGER_PATH = "community/members/invitations.md";
const MEMBERS_DIR = "community/members";
const TOKEN_TTL_MS = 7 * 86400 * 1000;

/**
 * Atomic 4-file commit redemption orchestrator.
 *
 * Steps (spec §11.2 redemption + §11.5 H2/H3/H12/H13):
 *   1. Read ledger; reject if JTI has a final row (H2/H3 defense-in-depth).
 *   2. Read roster + aliases; resolve slug + collision (H12).
 *   3. Build 4 file contents (roster row, alias row, ledger row, profile).
 *   4. Capture HEAD SHA (CAS anchor).
 *   5. Commit. On sha_conflict: retry ONCE with re-read ledger.
 *   6. Emit logRedemptionEvent at terminal points.
 */
export async function redeemInvitation(
  input: RedemptionInput,
): Promise<RedemptionResult> {
  const { payload, redeemerHandle, form, client, now } = input;

  const ledgerFile = await client.readFile(LEDGER_PATH);
  if (!ledgerFile) {
    logRedemptionEvent({
      jti: payload.jti,
      event: "invalid",
      redeemerGh: redeemerHandle,
      isoTimestamp: now().toISOString(),
    });
    return { ok: false };
  }
  const ledgerRows = parseInvitationsLedger(ledgerFile.content);
  if (jtiHasFinalRow(ledgerRows, payload.jti)) {
    logRedemptionEvent({
      jti: payload.jti,
      event: "replayed",
      redeemerGh: redeemerHandle,
      isoTimestamp: now().toISOString(),
    });
    return { ok: false };
  }

  const baseSlug = slugify(form.display_name);
  const exists = async (s: string): Promise<boolean> => {
    const memberPath = `${MEMBERS_DIR}/${s}.md`;
    return (await client.readFile(memberPath)) !== null;
  };
  let resolvedSlug: string;
  try {
    resolvedSlug = await nextAvailableSlug(baseSlug, exists);
  } catch {
    logRedemptionEvent({
      jti: payload.jti,
      event: "invalid",
      redeemerGh: redeemerHandle,
      isoTimestamp: now().toISOString(),
    });
    return { ok: false };
  }

  const rosterFile = await client.readFile(ROSTER_PATH);
  const aliasesFile = await client.readFile(ALIASES_PATH);
  if (!rosterFile || !aliasesFile) {
    logRedemptionEvent({
      jti: payload.jti,
      event: "invalid",
      redeemerGh: redeemerHandle,
      isoTimestamp: now().toISOString(),
    });
    return { ok: false };
  }

  const newRosterMd = appendMember(rosterFile.content, {
    name: form.display_name,
    githubHandle: redeemerHandle,
    telegram: form.telegram,
    link: form.link ?? "",
    focus: form.focus ?? "",
  });

  let newAliasesMd: string;
  try {
    newAliasesMd = appendAlias(aliasesFile.content, {
      email: form.git_email_alias,
      githubHandle: redeemerHandle,
    });
  } catch {
    logRedemptionEvent({
      jti: payload.jti,
      event: "invalid",
      redeemerGh: redeemerHandle,
      isoTimestamp: now().toISOString(),
    });
    return { ok: false };
  }

  const redeemedAt = now().toISOString();
  // Token has no `iat` field; reconstruct the issuance instant from `exp`
  // using the documented 7-day TTL (spec §11.2).
  const issuedAt = new Date(payload.exp * 1000 - TOKEN_TTL_MS).toISOString();
  const newLedgerMd = appendRedemptionRow(ledgerFile.content, {
    jti: payload.jti,
    issuedAt,
    issuedBy: `@${payload.iss}`,
    hintTelegram: payload.hint_telegram ?? "",
    redeemedAt,
    redeemedBy: `@${redeemerHandle}`,
  });

  const profileMd = generateConsentMarkdown({
    name: form.display_name,
    githubHandle: redeemerHandle,
  });

  const files: readonly { path: string; content: string }[] = [
    { path: ROSTER_PATH, content: newRosterMd },
    { path: ALIASES_PATH, content: newAliasesMd },
    { path: LEDGER_PATH, content: newLedgerMd },
    { path: `${MEMBERS_DIR}/${resolvedSlug}.md`, content: profileMd },
  ];

  const message =
    `invitation: redeem invite for @${redeemerHandle}\n\n` +
    `Invited-By: @${payload.iss}\n` +
    `Invitation-JTI: ${payload.jti}\n` +
    (payload.hint_telegram
      ? `Invitation-Hint-Telegram: ${payload.hint_telegram}\n`
      : "");

  let attempt = 0;
  for (;;) {
    attempt += 1;
    const expectedHeadSha = await client.getHeadSha();
    try {
      const result = await client.commitMultipleFiles({
        files,
        message,
        expectedHeadSha,
      });
      logRedemptionEvent({
        jti: payload.jti,
        event: "commit-success",
        redeemerGh: redeemerHandle,
        issuerGh: payload.iss,
        isoTimestamp: redeemedAt,
        httpStatus: 302,
      });
      return { ok: true, commitSha: result.commitSha };
    } catch (err: unknown) {
      const isConflict =
        typeof err === "object" &&
        err !== null &&
        (err as { kind?: string }).kind === "sha_conflict";

      if (!isConflict || attempt >= 2) {
        logRedemptionEvent({
          jti: payload.jti,
          event: attempt >= 2 ? "commit-retry" : "invalid",
          redeemerGh: redeemerHandle,
          isoTimestamp: now().toISOString(),
          httpStatus: attempt >= 2 ? 503 : 500,
        });
        return { ok: false };
      }

      logRedemptionEvent({
        jti: payload.jti,
        event: "commit-retry",
        redeemerGh: redeemerHandle,
        isoTimestamp: now().toISOString(),
      });
      const reReadLedger = await client.readFile(LEDGER_PATH);
      if (
        reReadLedger &&
        jtiHasFinalRow(parseInvitationsLedger(reReadLedger.content), payload.jti)
      ) {
        logRedemptionEvent({
          jti: payload.jti,
          event: "replayed",
          redeemerGh: redeemerHandle,
          isoTimestamp: now().toISOString(),
        });
        return { ok: false };
      }
    }
  }
}
