"use client";
import { useState, type FormEvent } from "react";
import { Pill } from "@/app/components/Pill";

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
    <form onSubmit={handleSubmit} className="bg-paper border-l-[3px] border-l-ink px-4 py-4 space-y-4">
      {hintTelegram && (
        <div
          role="alert"
          className="bg-cream-deep border-l-[3px] border-l-ink p-3 font-voice text-[11px] text-dust"
        >
          <strong className="font-voice text-ink">Note:</strong> This invitation was issued to{" "}
          <span className="font-mono">{hintTelegram}</span>. If that&apos;s not
          you, please don&apos;t proceed — close this page and ask the
          organizer for your own invitation.
        </div>
      )}

      <div>
        <label
          htmlFor="display_name"
          className="block font-voice text-[11px] uppercase tracking-[1px] text-dust"
        >
          Display name <span aria-hidden="true">*</span>
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          maxLength={80}
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="focus"
          className="block font-voice text-[11px] uppercase tracking-[1px] text-dust"
        >
          Focus area (optional)
        </label>
        <input
          id="focus"
          name="focus"
          type="text"
          maxLength={120}
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="link"
          className="block font-voice text-[11px] uppercase tracking-[1px] text-dust"
        >
          Link (optional, https only)
        </label>
        <input
          id="link"
          name="link"
          type="url"
          maxLength={200}
          placeholder="https://"
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="telegram"
          className="block font-voice text-[11px] uppercase tracking-[1px] text-dust"
        >
          Telegram handle <span aria-hidden="true">*</span>
        </label>
        <input
          id="telegram"
          name="telegram"
          type="text"
          required
          pattern="^@[a-zA-Z0-9_]{5,32}$"
          placeholder="@username"
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="git_email_alias"
          className="block font-voice text-[11px] uppercase tracking-[1px] text-dust"
        >
          Git email alias <span aria-hidden="true">*</span>
        </label>
        <input
          id="git_email_alias"
          name="git_email_alias"
          type="email"
          required
          maxLength={120}
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
        <p className="mt-1 font-voice text-[11px] text-dust">
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
        <label htmlFor="consent_accepted" className="font-body text-ink text-sm">
          I agree to be listed publicly on the community roster.
        </label>
      </div>

      <Pill variant="solid" type="submit" disabled={submitting}>
        {submitting ? "Completing…" : "Complete registration"}
      </Pill>

      {error && (
        <p className="font-voice text-[11px] text-alert">{error}</p>
      )}
    </form>
  );
}
