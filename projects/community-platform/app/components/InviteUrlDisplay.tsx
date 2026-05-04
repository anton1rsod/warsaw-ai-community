"use client";
import { useState } from "react";

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
      <label className="block text-sm font-medium">Invitation URL</label>
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 rounded border border-gray-300 px-3 py-2 font-mono text-sm"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-600">
        Paste this into a Telegram DM to the invitee. Token expires in 7 days.
      </p>
    </div>
  );
}
