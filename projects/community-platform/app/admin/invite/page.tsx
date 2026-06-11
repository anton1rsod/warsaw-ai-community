import { requireAdmin } from "@/lib/require-admin";
import { InviteForm } from "@/app/components/InviteForm";
import { mintInvitation } from "@/app/actions/mint-invitation";
import { MeetingInviteForm } from "@/app/components/MeetingInviteForm";
import { mintMeetingInvitation } from "@/app/actions/mint-meeting-invitation";
import { revokeInvitation } from "@/app/actions/revoke-invitation";
import { MonoLabel } from "@/app/components/MonoLabel";

// `auth()` (via requireAdmin) makes this dynamic — match /admin/health gate pattern.
export const dynamic = "force-dynamic";

export default async function AdminInvitePage(): Promise<React.JSX.Element> {
  await requireAdmin("/admin/invite");

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>Admin</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        Mint invitation
      </h1>
      <p className="mt-2 font-voice text-[11px] text-dust">
        Generate a personal invitation URL. Hand it to the invitee via Telegram
        DM. Tokens expire 7 days after mint.
      </p>
      <InviteForm action={mintInvitation} />
      <MeetingInviteForm mintAction={mintMeetingInvitation} revokeAction={revokeInvitation} />
    </main>
  );
}
