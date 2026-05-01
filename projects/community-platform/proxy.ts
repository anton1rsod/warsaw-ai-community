import { NextResponse, type NextRequest } from "next/server";
import { decode } from "next-auth/jwt";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { CONSENT_COOKIE } from "@/lib/consent-cookie";

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
    ? ["/login", "/no-access", "/consent"]
    : [
        "/login",
        "/no-access",
        "/consent",
        "/api/test-auth",
        "/api/test-reset-status",
      ],
);
// Any new public-route entry point (e.g. /.well-known/security.txt,
// /robots.txt, /sitemap.xml) must be added here or it will be auth-gated.
const PUBLIC_PREFIXES = [
  "/api/auth",
  "/_next",
  "/favicon",
  "/.well-known",
] as const;

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

export default async function proxy(
  req: NextRequest,
): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
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
  const consented = req.cookies.get(CONSENT_COOKIE)?.value === "1";
  if (!consented) {
    return NextResponse.redirect(new URL("/consent", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
