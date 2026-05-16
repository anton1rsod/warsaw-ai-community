import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { hasConsent } from "@/app/actions/consent";
import { CONSENT_COOKIE } from "@/lib/consent-cookie";

/**
 * Snapshot-stale recovery endpoint for the consent cookie.
 *
 * When a consented member loses their `waic-consented` cookie (cleared
 * cache, new device, different browser) AND the build-time content
 * snapshot doesn't yet reflect their profile commit, the proxy's
 * chat-14 hotfix (`proxy.ts` — re-seed cookie when `member.profile` is
 * present in the snapshot) can't help — the snapshot says "no profile",
 * so the proxy bounces them to /consent. The /consent page then calls
 * `hasConsent()` (live GitHub API) which returns true; if the page
 * `redirect("/home")`s from a Server Component, the cookie is NOT
 * committed (Server Components cannot `cookies().set()`), and /home →
 * proxy → /consent loops.
 *
 * This route handler closes the loop: it does its own auth + roster +
 * `hasConsent()` check, sets the cookie on its own response, and 307s
 * to /home in a single hop. Server Actions and Route Handlers are the
 * only Next.js surfaces that can mutate cookies on a redirect response.
 *
 * **Defense in depth**: every check is re-run — the route does not trust
 * the caller (the /consent page) to have already verified anything.
 *
 * **Public path**: `proxy.ts` lists `/api/consent/recover` in
 * `PUBLIC_PATHS` because the route's own consent check would otherwise
 * be unreachable (proxy's consent gate would bounce a cookie-less caller
 * to /consent). The route enforces auth + roster itself, so bypassing
 * the proxy gate is safe.
 */
export async function GET(req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.githubHandle) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const member = findMemberByHandle(session.githubHandle);
  if (!member) {
    return NextResponse.redirect(new URL("/no-access", req.url));
  }

  const consented = await hasConsent(session.githubHandle);
  if (!consented) {
    // The member hit recovery but the live API says they haven't
    // consented yet. Send them to /consent so the modal renders. The
    // /consent page repeats the same hasConsent check; if it changes
    // to true (rare race) the page would re-route here — defended
    // against by the route's own `consented` check above.
    return NextResponse.redirect(new URL("/consent", req.url));
  }

  const res = NextResponse.redirect(new URL("/home", req.url));
  res.cookies.set(CONSENT_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
