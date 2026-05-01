import { NextResponse, type NextRequest } from "next/server";
import { decode } from "next-auth/jwt";
import { findMemberByHandle } from "@/lib/content-snapshot";

// /api/test-auth is a dev-only session-forging route used by Playwright E2E.
// It MUST bypass the auth gate so unauthenticated tests can call it. The route
// itself enforces NODE_ENV !== "production" and returns 404 in prod, so this
// public-path entry is safe defense-in-depth even though prod traffic that
// reaches the route still gets 404'd.
const PUBLIC_PATHS = new Set<string>([
  "/login",
  "/no-access",
  "/api/test-auth",
]);
const PUBLIC_PREFIXES = ["/api/auth", "/_next", "/favicon"] as const;

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
    return null;
  } catch {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
