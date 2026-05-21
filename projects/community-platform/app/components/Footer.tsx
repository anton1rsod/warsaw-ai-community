import Link from "next/link";
import { s, type StringKey } from "@/lib/i18n/strings";

/**
 * Global <Footer> — v0.6 visual redesign (dark band, serif italic left,
 * mono links right). Renders on every page EXCEPT /login (omitted by
 * app/layout.tsx).
 *
 * O5 link order (Phase A renders 4 of 5; RSS deferred to Phase C):
 *   About · Telegram · GitHub · License
 *
 * About links to /handbook until /about ships in Phase C (chat-24 plan).
 *
 * v0.4.2 a11y fix (H64) preserved: no aria-label on empty divs. The prior
 * language-switcher placeholder div with aria-label="Language" has been
 * removed entirely; v0.5+ can re-introduce a properly-roled control.
 *
 * NOTE: `YEAR` is hardcoded "2026" to mirror the v0.4 baseline and keep
 * snapshot tests deterministic. v0.7 cleanup candidate: switch to
 * `new Date().getFullYear()` when locale formatting is added.
 */
const YEAR = "2026";

const TELEGRAM_URL = "https://t.me/warsaw_ai";
const GITHUB_REPO_URL = "https://github.com/anton1rsod/warsaw-ai-community";
const MIT_LICENSE_URL =
  "https://github.com/anton1rsod/warsaw-ai-community/blob/main/LICENSE";

interface FooterLink {
  key: string;
  href: string;
  labelKey: StringKey;
  external?: boolean;
}

const LINKS: readonly FooterLink[] = [
  { key: "about", href: "/handbook", labelKey: "chrome.footer.about" },
  {
    key: "telegram",
    href: TELEGRAM_URL,
    labelKey: "chrome.footer.telegram",
    external: true,
  },
  {
    key: "github",
    href: GITHUB_REPO_URL,
    labelKey: "chrome.footer.github",
    external: true,
  },
  {
    key: "license",
    href: MIT_LICENSE_URL,
    labelKey: "chrome.footer.license",
    external: true,
  },
];

export function Footer(): React.JSX.Element {
  const copyright = s("chrome.footer.copyrightFmt").replace("{year}", YEAR);
  return (
    <footer className="bg-ink text-cream font-display italic text-[11px] px-4 py-3 flex justify-between items-center">
      <div>
        <span>{copyright}</span>
        <span aria-hidden="true"> · </span>
        <span className="font-voice not-italic opacity-70 text-[10px]">
          {s("chrome.footer.builtInPublic")}
        </span>
      </div>
      <nav
        aria-label="Footer"
        className="font-voice not-italic text-[10px] opacity-85 flex gap-2"
      >
        {LINKS.map((link, idx) => (
          <span key={link.key} className="flex gap-2 items-center">
            {idx > 0 && <span aria-hidden="true">·</span>}
            {link.external ? (
              <a
                href={link.href}
                className="text-cream no-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {s(link.labelKey)}
              </a>
            ) : (
              <Link href={link.href} className="text-cream no-underline">
                {s(link.labelKey)}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </footer>
  );
}
