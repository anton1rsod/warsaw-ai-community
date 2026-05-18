import Link from "next/link";
import type { Route } from "next";
import { auth, signOut } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { s } from "@/lib/i18n/strings";
import { Avatar } from "@/app/components/Avatar";
import { HeaderMobileMenu } from "@/app/components/HeaderMobileMenu";

interface HeaderProps {
  activePath?: string;
  compact?: boolean;
}

const NAV_ITEMS: readonly {
  href: Route;
  key: "nav.home" | "nav.calendar" | "nav.projects" | "nav.members" | "nav.handbook";
}[] = [
  { href: "/" as Route, key: "nav.home" },
  { href: "/calendar" as Route, key: "nav.calendar" },
  { href: "/projects" as Route, key: "nav.projects" },
  { href: "/members" as Route, key: "nav.members" },
  { href: "/handbook" as Route, key: "nav.handbook" },
];

function navLinkClasses(href: string, activePath: string | undefined): string {
  const base = "text-sm text-neutral-900 hover:underline";
  const active = "text-accent-700 underline underline-offset-4 decoration-2";
  if (
    activePath &&
    (activePath === href || (href !== "/" && activePath.startsWith(href)))
  ) {
    return `${base} ${active}`;
  }
  return base;
}

export async function Header({
  activePath,
  compact = false,
}: HeaderProps = {}): Promise<React.JSX.Element> {
  const session = await auth();
  const handle = session?.githubHandle ?? null;
  const member = handle ? findMemberByHandle(handle) : undefined;
  const signedIn = Boolean(member);

  const resolvedNavItems = NAV_ITEMS.map((item) => ({
    href: item.href,
    label: s(item.key),
  }));

  return (
    <header className="border-b border-neutral-200 bg-white">
      {/* H65 — first focusable element on Tab */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-white focus:px-3 focus:py-2 focus:rounded focus:ring-2 focus:ring-accent-500"
      >
        {s("header.skipToContent")}
      </a>

      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-neutral-900 text-[18px] tracking-normal"
        >
          Warsaw AI
        </Link>

        {!compact && (
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6"
          >
            {resolvedNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClasses(item.href, activePath)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {signedIn ? (
            <div className="relative group">
              <button
                type="button"
                aria-label={s("header.userMenu")}
                aria-haspopup="menu"
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
              >
                <Avatar
                  name={member?.name ?? handle ?? ""}
                  handle={handle ?? ""}
                  size={32}
                />
              </button>
              <ul
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 rounded border border-neutral-200 bg-white shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity"
              >
                <li role="menuitem" className="px-4 py-2 text-sm text-neutral-500">
                  @{handle}
                </li>
                <li role="menuitem">
                  <Link
                    href="/this-week"
                    className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50"
                  >
                    {s("header.yourWeek")}
                  </Link>
                </li>
                <li role="menuitem">
                  <Link
                    href="/me/edit"
                    className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50"
                  >
                    {s("header.editProfile")}
                  </Link>
                </li>
                <li role="menuitem">
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button
                      type="submit"
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50"
                    >
                      {s("header.signOut")}
                    </button>
                  </form>
                </li>
              </ul>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-neutral-900 underline">
              {s("header.signIn")}
            </Link>
          )}
          {!compact && (
            <HeaderMobileMenu navItems={resolvedNavItems} signedIn={signedIn} />
          )}
        </div>
      </div>
    </header>
  );
}
