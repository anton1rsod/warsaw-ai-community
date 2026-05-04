import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { INVITE_COOKIE_NAME, verifyToken } from "@/lib/invitations";
import { OnboardForm } from "@/app/components/OnboardForm";
import { redeemInvitation as redeemAction } from "@/app/actions/redeem-invitation";

// auth() + cookies() + searchParams all force this route dynamic.
export const dynamic = "force-dynamic";

interface OnboardPageProps {
  readonly searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
}

/**
 * /onboard route — three render branches.
 *
 * H5 (redirect-to-clean-URL): handled in `proxy.ts:tryInviteHandoff`
 * (Server Components can't call `cookies().set()`). The proxy verifies
 * the token signature, sets `__Secure-warsaw_invite`, and 302-redirects
 * to the clean /onboard URL before this page ever runs. As a
 * defence-in-depth fallback (e.g. if the proxy is bypassed in a future
 * config change), the page treats `?token=invalid` the same way as a
 * direct GET — render the generic 404.
 *
 * H6 (cookie security): see `proxy.ts:tryInviteHandoff` for the cookie
 * options (HttpOnly + Secure (prod) + SameSite=Strict + Path=/onboard +
 * Max-Age=86400).
 *
 * Branches:
 *   1. ?token=anything   → notFound() (proxy handled valid case + redirect;
 *                          arriving here means proxy bypassed / token
 *                          invalid → fall through to single 404 response)
 *   2. cookie + no session → render signin form
 *   3. cookie + session + NOT in roster → render OnboardForm
 *   4. cookie + session + ALREADY in roster → notFound()
 *   5. no cookie + no token (direct GET) → notFound()
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

  // Branch 1: any ?token=… arriving here means the proxy didn't redirect.
  // Either the token was bad or proxy was bypassed. Both surface the
  // generic 404 via the closest not-found.tsx (info-leak prevention).
  if (tokenParam) notFound();

  // Branch 2-5: cookie-driven render.
  const cookieToken = cookieStore.get(INVITE_COOKIE_NAME)?.value;
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
