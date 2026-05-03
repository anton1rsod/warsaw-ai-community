"use client";
import { useState, type FormEvent } from "react";
import { InviteUrlDisplay } from "@/app/components/InviteUrlDisplay";

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
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="hint_telegram" className="block text-sm font-medium">
          Telegram hint (optional)
        </label>
        <input
          id="hint_telegram"
          name="hint_telegram"
          type="text"
          placeholder="@username"
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-600">
          Records who you intended to invite. Stored in the audit ledger.
        </p>
      </div>
      <div>
        <label htmlFor="hint_display_name" className="block text-sm font-medium">
          Display name hint (optional)
        </label>
        <input
          id="hint_display_name"
          name="hint_display_name"
          type="text"
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Minting…" : "Mint invitation URL"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <InviteUrlDisplay url={url} />
    </form>
  );
}
