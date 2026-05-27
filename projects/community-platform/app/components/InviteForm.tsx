"use client";
import { useState, type FormEvent } from "react";
import { InviteUrlDisplay } from "@/app/components/InviteUrlDisplay";
import { Pill } from "@/app/components/Pill";

export interface InviteFormProps {
  readonly action: (
    formData: FormData,
  ) => Promise<{ url?: string; error?: string }>;
}

export function InviteForm({
  action,
}: InviteFormProps): React.JSX.Element {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setUrl(null);
    try {
      const data = new FormData(e.currentTarget);
      const result = await action(data);
      if (result.url) setUrl(result.url);
      else if (result.error) setError(result.error);
    } catch {
      setError("Mint failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-paper border-l-[3px] border-l-ink px-4 py-4 space-y-4">
      <div>
        <label
          htmlFor="hint_telegram"
          className="block font-voice text-[11px] uppercase tracking-[1px] text-dust"
        >
          Telegram hint (optional)
        </label>
        <input
          id="hint_telegram"
          name="hint_telegram"
          type="text"
          placeholder="@username"
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
        <p className="mt-1 font-voice text-[11px] text-dust">
          Records who you intended to invite. Stored in the audit ledger.
        </p>
      </div>
      <div>
        <label
          htmlFor="hint_display_name"
          className="block font-voice text-[11px] uppercase tracking-[1px] text-dust"
        >
          Display name hint (optional)
        </label>
        <input
          id="hint_display_name"
          name="hint_display_name"
          type="text"
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      </div>
      <Pill type="submit" variant="solid" disabled={submitting}>
        {submitting ? "Minting…" : "Mint invitation URL"}
      </Pill>
      {error && (
        <p className="font-voice text-[11px] text-alert">{error}</p>
      )}
      <InviteUrlDisplay url={url} />
    </form>
  );
}
