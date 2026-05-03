import { auth, signOut } from "@/lib/auth";
import {
  findMemberByHandle,
  isAdmin,
  isCommunityManager,
} from "@/lib/content-snapshot";
import { env } from "@/lib/env";

type RoleLabel = "admin" | "community manager" | "member" | "guest";

function describeRole(handle: string): RoleLabel {
  const member = findMemberByHandle(handle);
  if (!member) return "guest";
  if (isAdmin(handle)) return "admin";
  if (isCommunityManager(handle)) return "community manager";
  return "member";
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const session = await auth();
  const handle = session?.githubHandle ?? "";
  const member = findMemberByHandle(handle);
  const role = describeRole(handle);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">{env.COMMUNITY_NAME}</h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="text-sm text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Sign out
          </button>
        </form>
      </header>

      <section className="mt-6">
        <h2 className="text-xl font-medium">
          Welcome, {member?.name ?? handle}
        </h2>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Role: <strong>{role}</strong>
        </p>
      </section>

      <nav className="mt-8 grid gap-3 sm:grid-cols-2">
        <a
          className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          href="/members"
        >
          Members
        </a>
        <a
          className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          href="/projects"
        >
          Projects
        </a>
        <a
          className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          href="/decisions"
        >
          Decisions
        </a>
        <a
          className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          href="/meetings"
        >
          Meetings
        </a>
        <a
          className="rounded border border-neutral-300 p-4 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900 sm:col-span-2"
          href="/this-week"
        >
          This week
        </a>
      </nav>
    </main>
  );
}
