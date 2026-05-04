"use client";
import { useState, type FormEvent } from "react";

export interface OnboardFormProps {
  readonly action: (
    formData: FormData,
  ) => Promise<{ ok?: boolean; error?: string }>;
  readonly hintTelegram: string | null;
}

export function OnboardForm({
  action,
  hintTelegram,
}: OnboardFormProps): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = new FormData(e.currentTarget);
      const result = await action(data);
      if (result.error) setError(result.error);
      // Success: server action redirects; nothing else to do here.
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hintTelegram && (
        <div
          role="alert"
          className="rounded border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <strong>Note:</strong> This invitation was issued to{" "}
          <span className="font-mono">{hintTelegram}</span>. If that&apos;s not
          you, please don&apos;t proceed — close this page and ask the
          organizer for your own invitation.
        </div>
      )}

      <div>
        <label htmlFor="display_name" className="block text-sm font-medium">
          Display name <span aria-hidden="true">*</span>
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          maxLength={80}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="focus" className="block text-sm font-medium">
          Focus area (optional)
        </label>
        <input
          id="focus"
          name="focus"
          type="text"
          maxLength={120}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="link" className="block text-sm font-medium">
          Link (optional, https only)
        </label>
        <input
          id="link"
          name="link"
          type="url"
          maxLength={200}
          placeholder="https://"
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="telegram" className="block text-sm font-medium">
          Telegram handle <span aria-hidden="true">*</span>
        </label>
        <input
          id="telegram"
          name="telegram"
          type="text"
          required
          pattern="^@[a-zA-Z0-9_]{5,32}$"
          placeholder="@username"
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="git_email_alias" className="block text-sm font-medium">
          Git email alias <span aria-hidden="true">*</span>
        </label>
        <input
          id="git_email_alias"
          name="git_email_alias"
          type="email"
          required
          maxLength={120}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-600">
          Used to map your git commits to your roster entry.
        </p>
      </div>

      <div className="flex items-start gap-2">
        <input
          id="consent_accepted"
          name="consent_accepted"
          type="checkbox"
          required
          value="true"
          className="mt-1"
        />
        <label htmlFor="consent_accepted" className="text-sm">
          I agree to be listed publicly on the community roster.
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Completing…" : "Complete registration"}
      </button>

      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
