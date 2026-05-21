import { headers } from "next/headers";
import Link from "next/link";
import type { Route } from "next";
import { auth, signOut } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { s, type StringKey } from "@/lib/i18n/strings";
import { HeaderMobileMenu } from "@/app/components/HeaderMobileMenu";

interface HeaderProps {
  /**
   * Optional explicit active path. When provided, overrides the value read
   * server-side from `headers().get("x-pathname")`. RootShell still passes
   * this for backwards-compat with v0.4 callers; new code should rely on
   * the headers() read.
   */
  activePath?: string;
  compact?: boolean;
}

/**
 * Nav model — every label is sourced from the i18n map (H67/H88). Each item's
 * `key` becomes the active-page comparison anchor and the React key.
 */
const NAV_ITEMS: readonly {
  key: "home" | "calendar" | "projects" | "members" | "handbook";
  href: Route;
  labelKey: StringKey;
}[] = [
  { key: "home",     href: "/" as Route,         labelKey: "chrome.header.nav.home" },
  { key: "calendar", href: "/calendar" as Route, labelKey: "chrome.header.nav.calendar" },
  { key: "projects", href: "/projects" as Route, labelKey: "chrome.header.nav.projects" },
  { key: "members",  href: "/members" as Route,  labelKey: "chrome.header.nav.members" },
  { key: "handbook", href: "/handbook" as Route, labelKey: "chrome.header.nav.handbook" },
];

/**
 * Active-page matcher (H90).
 *
 *   /          → active when pathname is "/" or "/home"
 *   /<x>       → active when pathname === "/<x>" OR starts with "/<x>/"
 */
function isCurrent(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/" || pathname === "/home";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialsOf(handle: string): string {
  return handle.slice(0, 2).toUpperCase();
}

export async function Header({
  activePath,
  compact = false,
}: HeaderProps = {}): Promise<React.JSX.Element> {
  const session = await auth();
  const handle = session?.githubHandle ?? null;
  const member = handle ? findMemberByHandle(handle) : undefined;
  const signedIn = Boolean(member);

  // H90 — active-page indicator. Prefer the explicit activePath prop (so
  // tests + legacy callers still work) but fall back to the proxy-set
  // x-pathname header on every request. Both paths route through isCurrent.
  const h = await headers();
  const pathname = activePath ?? h.get("x-pathname");

  return (
    <header className="bg-ink text-cream font-voice text-[11px] tracking-[0.5px] px-4 py-2 flex justify-between items-center">
      {/* H65 — first focusable element on Tab */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-cream focus:text-ink focus:px-3 focus:py-1 focus:ring-2 focus:ring-accent-500"
      >
        {s("header.skipToContent")}
      </a>

      <Link
        href="/"
        className="font-bold text-cream no-underline"
      >
        {s("chrome.header.logo")}
      </Link>

      {!compact && (
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-3"
        >
          {NAV_ITEMS.map((item, idx) => (
            <span key={item.key} className="flex items-center gap-3">
              {idx > 0 && (
                <span aria-hidden="true" className="opacity-50">
                  ·
                </span>
              )}
              <Link
                href={item.href}
                className={`no-underline ${
                  isCurrent(item.href, pathname)
                    ? "text-accent-500"
                    : "text-cream opacity-85 hover:opacity-100"
                }`}
              >
                {s(item.labelKey)}
              </Link>
            </span>
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
              className="flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <span
                aria-hidden="true"
                className="w-[18px] h-[18px] bg-accent-500 flex items-center justify-center text-ink font-voice font-bold text-[9px]"
              >
                {initialsOf(handle ?? "")}
              </span>
              <span className="text-cream opacity-85">
                {handle} ▾
              </span>
            </button>
            <ul
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 border border-ink/20 bg-cream text-ink shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity"
            >
              <li role="menuitem" className="px-4 py-2 text-[11px] font-voice opacity-70">
                @{handle}
              </li>
              <li role="menuitem">
                <Link
                  href="/this-week"
                  className="block px-4 py-2 text-[11px] font-voice text-ink hover:bg-cream-deep no-underline"
                >
                  {s("chrome.header.dropdown.yourWeek")}
                </Link>
              </li>
              <li role="menuitem">
                <Link
                  href="/me/edit"
                  className="block px-4 py-2 text-[11px] font-voice text-ink hover:bg-cream-deep no-underline"
                >
                  {s("chrome.header.dropdown.editProfile")}
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
                    className="block w-full text-left px-4 py-2 text-[11px] font-voice text-ink hover:bg-cream-deep"
                  >
                    {s("chrome.header.dropdown.signOut")}
                  </button>
                </form>
              </li>
            </ul>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-cream opacity-85 hover:opacity-100 no-underline"
          >
            {s("chrome.header.signIn")}
          </Link>
        )}
        {!compact && (
          <HeaderMobileMenu
            navItems={NAV_ITEMS.map((item) => ({
              href: item.href,
              label: s(item.labelKey),
            }))}
          />
        )}
      </div>
    </header>
  );
}
