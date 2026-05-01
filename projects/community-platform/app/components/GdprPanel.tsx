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
    <section className="rounded border border-red-200 p-4 dark:border-red-900">
      <h3 className="text-lg font-medium">Data controls</h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Export or delete your data. Deletion removes your profile file and all
        status updates from the repo&apos;s main branch; commits in history
        remain attributable to your GitHub handle.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={exportData}
          disabled={busy}
          className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-900"
        >
          Export my data
        </button>
        <button
          type="button"
          onClick={deleteData}
          disabled={busy}
          className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          Delete my data
        </button>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {message}
        </span>
      </div>
    </section>
  );
}
