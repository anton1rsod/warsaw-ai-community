import { signOut } from "@/lib/auth";
import { env } from "@/lib/env";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Pill } from "@/app/components/Pill";

export default function NoAccessPage(): React.JSX.Element {
  return (
    <main id="main" className="mx-auto max-w-md px-6 py-10">
      <MonoLabel>// access</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        No platform access
      </h1>
      <p className="mt-2 font-voice text-[11px] text-dust">
        Your GitHub account isn&apos;t on the {env.COMMUNITY_NAME} roster yet.
        To request membership, reach out in the community Telegram channel.
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="mt-6"
      >
        <Pill variant="dashed" type="submit">
          Sign out
        </Pill>
      </form>
    </main>
  );
}
