import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";
import { InviteForm } from "@/app/components/InviteForm";
import { mintInvitation } from "@/app/actions/mint-invitation";

// `auth()` makes this dynamic — match /admin/health gate pattern.
export const dynamic = "force-dynamic";

export default async function AdminInvitePage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.githubHandle) redirect("/login");
  if (!isAdmin(session.githubHandle)) redirect("/home");

  return (
    <main className="mx-auto max-w-prose p-6">
      <h1 className="text-2xl font-semibold">Mint invitation</h1>
      <p className="mt-2 text-sm text-gray-700">
        Generate a personal invitation URL. Hand it to the invitee via Telegram
        DM. Tokens expire 7 days after mint.
      </p>
      <InviteForm action={mintInvitation} />
    </main>
  );
}
