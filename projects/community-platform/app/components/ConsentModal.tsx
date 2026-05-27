"use client";

import React, { useEffect, useRef } from "react";
import { Pill } from "@/app/components/Pill";

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
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && typeof dialog.showModal === "function" && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="consent-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!disabled) onCancel();
      }}
      className="backdrop:bg-ink/50 bg-cream border border-ink p-6 max-w-md text-ink"
    >
      <h2
        id="consent-modal-title"
        className="font-display font-semibold text-ink text-xl"
      >
        Opt in to the Warsaw AI Community platform
      </h2>
      <ul className="mt-4 space-y-2 font-body text-ink text-sm">
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
        <Pill variant="solid" type="button" onClick={onAccept} disabled={disabled}>
          Accept and continue
        </Pill>
        <Pill variant="dashed" type="button" onClick={onCancel} disabled={disabled}>
          Cancel — go back
        </Pill>
      </div>
    </dialog>
  );
}
