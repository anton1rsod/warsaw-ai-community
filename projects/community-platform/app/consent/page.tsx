import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { hasConsent } from "@/app/actions/consent";
import { ConsentClient } from "@/app/consent/ConsentClient";

// Always render fresh: hasConsent's truth value can change between
// requests (the bot just committed the profile, or the user just
// rotated their cookie). ISR would surface a stale "needs consent"
// modal to a member who already accepted.
export const dynamic = "force-dynamic";

export default async function ConsentPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.githubHandle) redirect("/login");

  const member = findMemberByHandle(session.githubHandle);
  if (!member) redirect("/no-access");

  // Snapshot-stale recovery: hasConsent() is the live source of truth
  // (reads the profile file directly via GitHub App). If live says
  // "consented" but the proxy bounced us here anyway, the consent
  // cookie is missing AND the build-time snapshot doesn't yet reflect
  // the profile. A bare `redirect("/home")` from this Server Component
  // can't `cookies().set()`, so /home → proxy → /consent would loop.
  // /api/consent/recover (Route Handler) sets the cookie on its own
  // response, breaking the loop in a single hop.
  if (await hasConsent(session.githubHandle))
    redirect("/api/consent/recover");

  return <ConsentClient />;
}
