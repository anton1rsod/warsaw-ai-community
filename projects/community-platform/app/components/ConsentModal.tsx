"use client";

export interface ConsentModalProps {
  onAccept: () => void;
  onCancel: () => void;
  disabled: boolean;
}

export function ConsentModal({
  onAccept,
  onCancel,
  disabled,
}: ConsentModalProps): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
    >
      <div className="mx-4 max-w-md rounded bg-white p-6 dark:bg-neutral-900">
        <h2 id="consent-modal-title" className="text-xl font-semibold">
          Opt in to the Warsaw AI Community platform
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            Your status updates will be committed to a public MIT-licensed
            repository.
          </li>
          <li>You can edit or delete them at any time.</li>
          <li>
            You can request full data export or deletion of your profile at any
            time.
          </li>
        </ul>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
            disabled={disabled}
          >
            Accept and continue
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-4 py-2 hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
            disabled={disabled}
          >
            Cancel — go back
          </button>
        </div>
      </div>
    </div>
  );
}
