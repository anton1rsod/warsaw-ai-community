"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

interface HeaderNavItem {
  /** Stable React key + semantic id (used by Header.tsx). */
  key: string;
  /** Resolved server-side from the NAV_ITEMS table. */
  href: Route;
  /** Resolved server-side via i18n `s(labelKey)` before being passed in. */
  label: string;
}

interface HeaderNavProps {
  items: readonly HeaderNavItem[];
}

/**
 * Active-page matcher (mirrors Header's prior v0.6 logic so the rendered
 * output is byte-identical for the active state):
 *
 *   /         → active when pathname is "/" or "/home"
 *   /<x>      → active when pathname === "/<x>" OR starts with "/<x>/"
 */
function isCurrent(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/" || pathname === "/home";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop primary nav (v0.8.1 chat-44 followup).
 *
 * Extracted from `Header.tsx` into a Client Component so the active-page
 * indicator (H90, originally from v0.6) is reactive to Next.js soft
 * navigation.
 *
 * Background: `Header.tsx` is an async Server Component rendered inside the
 * cached root layout. App Router's soft `<Link>` navigations re-render the
 * page body but NOT the layout, so a server-rendered
 * `headers().get("x-pathname")` value goes stale after the first hard nav —
 * the indicator stayed pinned to the previous page. Reading `usePathname()`
 * here keeps the indicator live without sacrificing the rest of `Header`
 * staying server-rendered (auth check, dropdown, lockup, city chip).
 *
 * The component is pure presentation — it owns no state, has no effects, and
 * does not mutate the URL. It just reads the live pathname and toggles a
 * className.
 */
export function HeaderNav({ items }: HeaderNavProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden md:flex items-center gap-3">
      {items.map((item, idx) => (
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
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
