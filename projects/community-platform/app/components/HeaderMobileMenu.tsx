"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { s } from "@/lib/i18n/strings";

interface HeaderMobileMenuProps {
  navItems: { href: Route; label: string }[];
}

/**
 * Mobile slide-in panel (Q2.5 / O7 variant A):
 *   - translateX(100% → 0) over 200ms cubic-bezier(0.4, 0.0, 0.2, 1)
 *   - backdrop bg-neutral-900/40 fade-in over 150ms; no blur
 *   - close on Escape; close on backdrop click
 *
 * H58 stability: panel state lives in `useState`; hamburger toggle never
 * mutates auth state. No hydration flash because the panel is closed by
 * default + server-renders empty.
 */
export function HeaderMobileMenu({
  navItems,
}: HeaderMobileMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label={open ? s("header.menuClose") : s("header.menu")}
        aria-expanded={open}
        aria-controls="header-mobile-panel"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden p-2"
      >
        <span aria-hidden>{open ? "✕" : "☰"}</span>
      </button>
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-neutral-900/40 transition-opacity duration-150"
        />
      )}
      <nav
        id="header-mobile-panel"
        aria-label={s("header.menu")}
        aria-hidden={!open}
        className={`fixed right-0 top-0 bottom-0 z-50 w-72 bg-white shadow-xl transition-transform duration-200 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        <ul className="p-6 flex flex-col gap-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block text-lg text-neutral-900 hover:underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
