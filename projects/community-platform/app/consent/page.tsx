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

  if (await hasConsent(session.githubHandle)) redirect("/home");

  return <ConsentClient />;
}
