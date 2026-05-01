import { signOut } from "@/lib/auth";
import { env } from "@/lib/env";

export default function NoAccessPage(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-3xl font-semibold">No platform access</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
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
        <button
          type="submit"
          className="rounded border border-neutral-300 px-4 py-2 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
