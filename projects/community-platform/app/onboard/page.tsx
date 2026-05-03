import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { verifyToken } from "@/lib/invitations";
import { OnboardForm } from "@/app/components/OnboardForm";
import { redeemInvitation as redeemAction } from "@/app/actions/redeem-invitation";

// auth() + cookies() + searchParams all force this route dynamic.
export const dynamic = "force-dynamic";

const COOKIE_NAME = "__Secure-warsaw_invite";

interface OnboardPageProps {
  readonly searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
}

/**
 * /onboard route — three render branches + first-GET cookie handoff.
 *
 * H5 (redirect-to-clean-URL): first GET with `?token=…` verifies the
 * token, sets `__Secure-warsaw_invite`, then 302-redirects to `/onboard`
 * (no query). Result: the original token-bearing URL hits Vercel access
 * logs once per redemption; the URL bar is cleaned post-redirect.
 *
 * H6 (cookie security): `__Secure-warsaw_invite` is set HttpOnly +
 * Secure (in production) + SameSite=Strict + Path=/onboard +
 * Max-Age=86400. Path scope is /onboard so the cookie survives the
 * OAuth round-trip (callbackUrl /onboard) without bleeding to other
 * routes.
 *
 * Branches:
 *   1. ?token=valid     → set cookie + redirect to clean /onboard
 *   2. ?token=invalid   → notFound()
 *   3. cookie + no session → render signin form
 *   4. cookie + session + NOT in roster → render OnboardForm
 *   5. cookie + session + ALREADY in roster → notFound()
 *   6. no cookie + no token (direct GET) → notFound()
 *
 * All non-OK branches use notFound() (single response shape) — no info
 * leak about which check failed (spec §11.5 H7).
 */
export default async function OnboardPage({
  searchParams,
}: OnboardPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const tokenParam = typeof params.token === "string" ? params.token : null;
  const cookieStore = await cookies();

  // Branch 1 (H5): first GET with ?token=… → set cookie + redirect to clean URL.
  if (tokenParam) {
    const verified = verifyToken(tokenParam, env.INVITE_SECRET);
    if (!verified) notFound();

    cookieStore.set(COOKIE_NAME, tokenParam, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/onboard",
      maxAge: 86400,
    });
    redirect("/onboard");
  }

  // Branch 2-6: cookie-driven render.
  const cookieToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookieToken) notFound();

  const verified = verifyToken(cookieToken, env.INVITE_SECRET);
  if (!verified) notFound();

  const session = await auth();
  if (!session?.githubHandle) {
    return (
      <main className="mx-auto max-w-prose p-6">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="mt-2 text-sm text-gray-700">
          Sign in with GitHub to complete your invitation.
        </p>
        <form
          action="/api/auth/signin/github"
          method="POST"
          className="mt-4"
        >
          <input type="hidden" name="callbackUrl" value="/onboard" />
          <button
            type="submit"
            className="rounded bg-gray-900 px-4 py-2 font-medium text-white"
          >
            Sign in with GitHub
          </button>
        </form>
      </main>
    );
  }

  // Already a member → opaque error page (no enumeration of failure modes).
  if (findMemberByHandle(session.githubHandle)) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-prose p-6">
      <h1 className="text-2xl font-semibold">Complete your registration</h1>
      <p className="mt-2 mb-4 text-sm text-gray-700">
        Signed in as{" "}
        <span className="font-mono">@{session.githubHandle}</span>.
      </p>
      <OnboardForm
        action={redeemAction}
        hintTelegram={verified.hint_telegram ?? null}
      />
    </main>
  );
}
