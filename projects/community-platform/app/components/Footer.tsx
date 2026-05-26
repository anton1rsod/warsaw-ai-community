import Link from "next/link";
import { s, type StringKey } from "@/lib/i18n/strings";
import { BrandStar } from "@/app/components/BrandStar";

/**
 * Global <Footer> — v0.7 brand v1.2 wire-in (chat-41).
 *
 * Three stacked elements:
 *   1. Formal entity line (NEW v0.7) — JetBrains Mono caps, cream/60 opacity, divider below.
 *      Renders "PROFESSIONAL SUBPLOTERS* ASSOCIATION" with the BrandStar superscript.
 *   2. Copyright row — Geist italic 11px, with BrandStar on "Subploters*" (v0.7).
 *      "built in public, MIT" segment REMOVED in v0.7 (brand v1.2 simplification).
 *   3. Links row (right side, same row as copyright) — JetBrains Mono small, unchanged.
 *
 * Renders on every page EXCEPT /login (omitted by app/layout.tsx).
 *
 * NOTE: `YEAR` stays hardcoded "2026" to mirror the v0.4 baseline and keep
 * snapshot tests deterministic. v0.7+ cleanup candidate flagged separately.
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
  const [copyrightBefore, copyrightAfter = ""] = copyright.split("Subploters");
  return (
    <footer className="bg-ink text-cream px-4 py-3">
      {/* v0.7 §4.4 formal entity line — JetBrains Mono caps, dim, divider below */}
      <div
        data-testid="formal-entity-line"
        className="font-voice font-medium uppercase text-[10px] tracking-[0.18em] opacity-60 pb-1.5 border-b border-cream/10 mb-2"
      >
        Professional Subploters<BrandStar /> Association
      </div>
      {/* v0.7 copyright + links row — copyright wears the BrandStar; flex-gap prevents collapse */}
      <div className="font-display italic text-[11px] flex justify-between items-center gap-8 flex-wrap">
        <div>
          <span>
            {copyrightBefore}Subploters<BrandStar />
            {copyrightAfter}
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
      </div>
    </footer>
  );
}
