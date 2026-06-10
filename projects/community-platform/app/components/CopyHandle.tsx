"use client";

import { useState } from "react";
import { s } from "@/lib/i18n/strings";

/**
 * v0.12 O2 — actions-row fallback when the roster carries no Telegram
 * handle: copies the member's @github handle to the clipboard. Deliberately
 * NOT a Pill: the §3 actions row is quiet mono typography (D5/D6 approved
 * mockup); a solid Pill here would be the loud move v4 rejected. ≥24px hit
 * area per H159 / SC 2.5.8.
 */
export function CopyHandle({ handle }: { handle: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  function onCopy(): void {
    navigator.clipboard
      .writeText(`@${handle}`)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex min-h-[24px] items-center py-1 font-voice text-[12px] text-ink underline decoration-accent-500 underline-offset-2 hover:text-dust"
    >
      {copied
        ? s("members.detail.copiedHandle")
        : s("members.detail.copyHandle").replace("{handle}", handle)}
    </button>
  );
}
