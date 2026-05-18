import { NextResponse, type NextRequest } from "next/server";
import { decode } from "next-auth/jwt";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { CONSENT_COOKIE } from "@/lib/consent-cookie";
import {
  INVITE_COOKIE_NAME,
  inviteCookieOptions,
  verifyToken,
} from "@/lib/invitations";

// `/consent` is reachable while not yet consented (that's the whole
// point — first-time roster members hit this page to opt in). Every
// other route is gated behind {auth, roster, consent}.
//
// `/api/test-auth` and `/api/test-reset-status` are dev-only public
// paths. In production they're omitted entirely so an accidental
// NEXT_PUBLIC_E2E_MODE=1 deploy can't unauthenticate them — the proxy
// redirects any caller to /login, and the route itself returns 404.
// Defense-in-depth.
const PUBLIC_PATHS = new Set<string>(
  process.env.NODE_ENV === "production"
    ? [
        // ADR-0014 (v0.4) + extends ADR-0012 (v0.3):
        "/",                  // ADR-0014 — anonymous hero landing
        "/login",
        "/no-access",
        "/consent",
        "/api/consent/recover",
        "/onboard",
        "/onboard/error",
        // v0.3 Discovery+ public surfaces (ADR-0012):
        "/home",
        "/events",
        "/meetings",
        "/calendar",          // ADR-0014 — unified events+meetings index (D27)
        "/handbook",          // ADR-0014 — charter pointer + roadmap (D26 + Q6.1(i))
        "/api/calendar.ics",
        "/manifest.json",
      ]
    : [
        // ADR-0014 (v0.4) + extends ADR-0012 (v0.3):
        "/",
        "/login",
        "/no-access",
        "/consent",
        "/api/consent/recover",
        "/onboard",
        "/onboard/error",
        "/api/test-auth",
        "/api/test-reset-status",
        "/api/test-reset-consent",
        "/api/test-mark-consented",
        "/api/test-reset-invitations",
        "/api/test-reset-profile",
        "/api/test-mint-expired",
        // v0.3 Discovery+ public surfaces (ADR-0012):
        "/home",
        "/events",
        "/meetings",
        "/calendar",
        "/handbook",
        "/api/calendar.ics",
        "/manifest.json",
      ],
);
// Any new public-route entry point (e.g. /.well-known/security.txt,
// /robots.txt, /sitemap.xml) must be added here or it will be auth-gated.
const PUBLIC_PREFIXES = [
  "/api/auth",
  "/_next",
  "/favicon",
  "/.well-known",
  // v0.3 Discovery+ prefix surfaces (ADR-0012):
  "/events/",
  "/meetings/",
  "/icons/",
] as const;

/**
 * H4 (spec §11.5): /onboard* responses carry Referrer-Policy, X-Frame-Options,
 * and Cache-Control: no-store so an invitation token in the URL doesn't leak
 * via Referer header on outbound clicks, can't be framed, and isn't cached.
 */
function applyOnboardHeaders(res: NextResponse): NextResponse {
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

const COOKIE_NAME = "authjs.session-token";
const SECURE_COOKIE_NAME = "__Secure-authjs.session-token";

/**
 * Read the GitHub handle from the Auth.js v5 session JWT cookie.
 *
 * Uses manual `decode()` instead of the `auth()` helper because `auth()`
 * called bare only works inside Server Components / Route Handlers. In a
 * Next 16 `proxy.ts` the idiomatic alternatives are either the
 * `auth(handler)` wrapper or this explicit decode. Explicit decode keeps
 * the auth gate readable end-to-end and is easier to unit-test.
 *
 * Returns null when the cookie is missing, NEXTAUTH_SECRET is unset, the
 * JWT can't be decoded (wrong secret, tampered, expired), or the payload
 * lacks a string `githubHandle` field.
 */
async function getHandleFromRequest(
  req: NextRequest,
): Promise<string | null> {
  const secureCookie = req.cookies.get(SECURE_COOKIE_NAME);
  const plainCookie = req.cookies.get(COOKIE_NAME);
  const cookie = secureCookie ?? plainCookie;
  if (!cookie?.value) return null;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  // Salt MUST match the cookie name used to set the cookie. Auth.js derives
  // the encryption key from (secret, salt); a mismatch silently fails decode.
  const salt = secureCookie ? SECURE_COOKIE_NAME : COOKIE_NAME;

  try {
    const decoded = await decode({ token: cookie.value, secret, salt });
    if (
      decoded &&
      typeof (decoded as { githubHandle?: unknown }).githubHandle === "string"
    ) {
      return (decoded as { githubHandle: string }).githubHandle;
    }
    // Cookie present and decode succeeded, but no githubHandle: schema drift
    // signal worth surfacing so a beta bump that changes JWT payload shape
    // doesn't cause a silent invisible auth outage.
    console.error(
      "[proxy] session JWT decoded but missing githubHandle — schema drift?",
    );
    return null;
  } catch (err) {
    // Decode failure: malformed, tampered, expired, secret rotation, OR cookie
    // name change in next-auth that left a stale-named cookie unparseable.
    // Single line of signal so the on-call has something to grep.
    console.error(
      "[proxy] JWT decode failed:",
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

/**
 * H5 (spec §11.5): redirect-to-clean-URL for /onboard?token=…
 *
 * When a user clicks an invitation URL, the proxy verifies the token's
 * HMAC signature, sets the `__Secure-warsaw_invite` cookie scoped to
 * /onboard, and 302-redirects to the clean /onboard URL. The
 * token-bearing URL therefore touches Vercel access logs ONCE per
 * redemption, and the URL bar is cleaned post-redirect.
 *
 * Why proxy.ts rather than the page: Server Components can't call
 * `cookies().set()` (Next.js raises "Cookies can only be modified in a
 * Server Action or Route Handler"). The proxy CAN modify cookies on the
 * outgoing response. Doing the handoff here also collapses two GETs
 * (page + redirect) into one early-return at the proxy boundary.
 *
 * If the token signature/exp/schema is invalid, return null so the
 * caller falls through to the standard PUBLIC_PATHS path. The page then
 * sees no cookie and renders the generic 404 (info-leak prevention).
 */
function tryInviteHandoff(
  req: NextRequest,
  token: string,
): NextResponse | null {
  const secret = process.env.INVITE_SECRET;
  if (!secret) return null;
  const verified = verifyToken(token, secret);
  if (!verified) return null;

  const cleanUrl = new URL("/onboard", req.url);
  const res = NextResponse.redirect(cleanUrl);
  res.cookies.set(INVITE_COOKIE_NAME, token, inviteCookieOptions());
  applyOnboardHeaders(res);
  return res;
}

export default async function proxy(
  req: NextRequest,
): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // H5: handle /onboard?token=… handoff before falling into PUBLIC_PATHS.
  // A successful handoff returns a 302 to the clean URL with the cookie
  // attached; failures (bad signature/exp/schema) fall through to the
  // page so the page emits the same generic 404 as a direct GET (no
  // info leak).
  if (pathname === "/onboard") {
    const tokenParam = req.nextUrl.searchParams.get("token");
    if (tokenParam) {
      const handoff = tryInviteHandoff(req, tokenParam);
      if (handoff) return handoff;
    }
  }

  if (PUBLIC_PATHS.has(pathname)) {
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
    if (pathname === "/onboard" || pathname === "/onboard/error") {
      return applyOnboardHeaders(res);
    }
    return res;
  }
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
    return res;
  }

  const handle = await getHandleFromRequest(req);

  if (!handle) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const member = findMemberByHandle(handle);
  if (!member) {
    return NextResponse.redirect(new URL("/no-access", req.url));
  }

  // Consent gate: roster members who haven't yet accepted the platform
  // terms (or whose cookie has been cleared) bounce to /consent. The
  // /consent page itself short-circuits to /home if the bot already
  // wrote their profile (cookie was the only thing missing); otherwise
  // it shows the modal.
  //
  // Fix for /home ↔ /consent redirect loop (2026-05-16, v0.2.0 post-ship):
  // /consent/page.tsx does `redirect("/home")` when hasConsent is true but
  // doesn't set the cookie (Server Components can't `cookies().set()`).
  // If the snapshot already shows the bot-written profile, we re-seed the
  // missing cookie INLINE here rather than bouncing through /consent. The
  // snapshot is the build-time projection of the same source-of-truth
  // (`community/members/<slug>.md`) that `hasConsent` checks live; using
  // the snapshot keeps the proxy synchronous (no GitHub API call per
  // request) and resolves the loop for the common case (Anton's cookie
  // cleared, profile committed weeks ago).
  const consented = req.cookies.get(CONSENT_COOKIE)?.value === "1";
  if (!consented) {
    if (member.profile) {
      const res = NextResponse.next();
      res.headers.set("x-pathname", pathname);
      res.cookies.set(CONSENT_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return res;
    }
    return NextResponse.redirect(new URL("/consent", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
