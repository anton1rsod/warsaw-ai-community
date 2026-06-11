"use client";

import { useState } from "react";
import { Pill } from "@/app/components/Pill";
import { s } from "@/lib/i18n/strings";

/**
 * v0.12 Phase 4.3 — copy-embed snippet for the shareable member card
 * (CopyHandle clipboard pattern). The OG route is public + CDN-cached;
 * GitHub camo proxies it, so this markdown works in any README.
 *
 * Canonical public origin is pinned: no SITE_URL env/constant exists in
 * the app, and the card is only addressable on the production deployment.
 */
const SITE_ORIGIN = "https://warsaw-ai-community-platform.vercel.app";

export function CardEmbedSnippet({
  name,
  slug,
}: {
  name: string;
  slug: string;
}): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const snippet = `![${name} — Subploters](${SITE_ORIGIN}/members/${slug}/opengraph-image)`;

  function onCopy(): void {
    void navigator.clipboard
      .writeText(snippet)
      .then(() => {
        // 2s reset per the InviteUrlDisplay precedent (reviewer triage).
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => setCopied(false));
  }

  return (
    <div className="mt-2 flex items-center gap-3">
      <code
        data-testid="card-embed-snippet"
        className="min-w-0 flex-1 truncate bg-cream-deep px-2 py-1 font-voice text-[11px] text-dust"
      >
        {snippet}
      </code>
      <Pill variant="solid" type="button" onClick={onCopy}>
        {copied
          ? s("members.detail.copiedHandle")
          : s("persona.editor.copyEmbed")}
      </Pill>
    </div>
  );
}
