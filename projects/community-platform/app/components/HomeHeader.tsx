import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { env } from "@/lib/env";

export async function HomeHeader(): Promise<React.JSX.Element> {
  const session = await auth();
  const handle = session?.githubHandle;
  const member = handle ? findMemberByHandle(handle) : undefined;
  const signedIn = Boolean(member);

  return (
    <header className="mb-6 flex items-baseline justify-between">
      <div>
        <h1 className="text-3xl font-semibold">{env.COMMUNITY_NAME}</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Discovery + decisions + ship cadence
        </p>
      </div>
      <nav
        aria-label="Account"
        className="flex items-center gap-3 text-sm"
      >
        {signedIn ? (
          <>
            <Link href="/this-week" className="hover:underline">
              Your week
            </Link>
            <Link href="/members" className="hover:underline">
              Members
            </Link>
            <Link href="/me/edit" className="hover:underline">
              Edit profile
            </Link>
            <span aria-hidden className="text-neutral-400">·</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              @{handle}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/home" });
              }}
            >
              <button
                type="submit"
                className="text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
