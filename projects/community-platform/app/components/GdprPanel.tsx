"use client";

import { useState } from "react";

const CONFIRM_MESSAGE =
  "Delete your profile and all status updates? This cannot be undone " +
  "(commits remain in git history but files are removed from main).";

export function GdprPanel(): React.JSX.Element {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const exportData = async (): Promise<void> => {
    setBusy(true);
    try {
      const res = await fetch("/api/me/export");
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `warsaw-ai-community-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Exported.");
    } catch (err: unknown) {
      setMessage(
        `Error: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteData = async (): Promise<void> => {
    if (!window.confirm(CONFIRM_MESSAGE)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/me/delete", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Deleted. Sign out to clear your session.");
    } catch (err: unknown) {
      setMessage(
        `Error: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border border-alert p-4">
      <h3 className="font-display font-semibold text-ink">Data controls</h3>
      <p className="mt-1 font-voice text-[11px] text-dust">
        Export or delete your data. Deletion removes your profile file and all
        status updates from the repo&apos;s main branch; commits in history
        remain attributable to your GitHub handle.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={exportData}
          disabled={busy}
          className="min-h-[24px] inline-flex items-center px-[11px] py-[4px] font-voice font-bold text-[10px] border-[1.5px] border-solid border-ink text-ink bg-transparent hover:bg-ink hover:text-cream transition-colors duration-150 disabled:opacity-50"
        >
          Export my data
        </button>
        <button
          type="button"
          onClick={deleteData}
          disabled={busy}
          className="min-h-[24px] inline-flex items-center px-[11px] py-[4px] font-voice font-bold text-[10px] border-[1.5px] border-solid border-alert text-alert bg-transparent hover:bg-alert hover:text-cream transition-colors duration-150 disabled:opacity-50"
        >
          Delete my data
        </button>
        <span className="font-voice text-[10px] text-dust">
          {message}
        </span>
      </div>
    </section>
  );
}
