import Link from "next/link";
import { s } from "@/lib/i18n/strings";

/**
 * Global <Footer> — Q3.1 / D30 / O5.
 *
 * Renders on every page EXCEPT /login (omitted by app/layout.tsx).
 *
 * O5 5-link strip in order:
 *   About · Telegram · RSS · GitHub · MIT-licensed
 *
 * Phase A renders 4 of 5 (RSS omitted — Phase C activates when /feed/*.xml
 * routes land). About links to /handbook until /about ships in Phase C.
 *
 * Telegram URL: https://t.me/warsaw_ai (placeholder — verify the actual
 * invite URL with Anton at chat-25 implementation start; the chat-24 plan
 * commits the URL here so chat-25 has it grep-able; H62-adjacent — the
 * URL is the only external Telegram entry point in the platform).
 */
const TELEGRAM_URL = "https://t.me/warsaw_ai";
const GITHUB_REPO_URL = "https://github.com/anton1rsod/warsaw-ai-community";
const MIT_LICENSE_URL = "https://github.com/anton1rsod/warsaw-ai-community/blob/main/LICENSE";

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-12">
      <div className="mx-auto max-w-5xl px-4 py-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">{s("footer.copyright")}</p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-4 text-sm text-neutral-700">
            <li>
              <Link href="/handbook" className="hover:underline">
                {s("footer.about")}
              </Link>
            </li>
            <li>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {s("footer.telegram")}
              </a>
            </li>
            <li>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {s("footer.github")}
              </a>
            </li>
            <li>
              <a
                href={MIT_LICENSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {s("footer.mit")}
              </a>
            </li>
          </ul>
        </nav>
        <div className="text-sm text-neutral-400">
          {/* v0.5+ next-intl populates this slot; aria-label re-added then with a real
              labelled control (axe `aria-prohibited-attr`: `aria-label` requires a
              valid role on a generic `<div>`). */}
        </div>
      </div>
    </footer>
  );
}
