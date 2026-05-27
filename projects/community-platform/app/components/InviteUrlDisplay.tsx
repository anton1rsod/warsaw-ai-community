"use client";
import { useState } from "react";
import { Pill } from "@/app/components/Pill";

export interface InviteUrlDisplayProps {
  readonly url: string | null;
}

export function InviteUrlDisplay({
  url,
}: InviteUrlDisplayProps): React.JSX.Element | null {
  const [copied, setCopied] = useState(false);
  if (!url) return null;

  // Capture in a const after the guard so the inner closure has a
  // narrowed-string reference (avoids TS's loss-of-narrowing in async
  // callbacks AND avoids `!` non-null assertion).
  const safeUrl = url;

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(safeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available; user can select-and-copy manually.
    }
  }

  return (
    <div className="mt-4">
      <label className="block font-voice text-[11px] uppercase tracking-[1px] text-dust">
        Invitation URL
      </label>
      <div className="mt-1 flex gap-2 items-center">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-voice text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <Pill type="button" variant="dashed" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </Pill>
      </div>
      <p className="mt-2 font-voice text-[11px] text-dust">
        Paste this into a Telegram DM to the invitee. Token expires in 7 days.
      </p>
    </div>
  );
}
