"use client";

import { useState } from "react";
import { s } from "@/lib/i18n/strings";
import { Pill } from "@/app/components/Pill";

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
      <h3 className="font-display font-semibold text-ink">{s("members.detail.dataControls")}</h3>
      <p className="mt-1 font-voice text-[11px] text-dust">
        Export or delete your data. Deletion removes your profile file and all
        status updates from the repo&apos;s main branch; commits in history
        remain attributable to your GitHub handle.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <Pill variant="solid" type="button" onClick={exportData} disabled={busy}>
          Export my data
        </Pill>
        <Pill variant="danger" type="button" onClick={deleteData} disabled={busy}>
          Delete my data
        </Pill>
        <span className="font-voice text-[10px] text-dust">
          {message}
        </span>
      </div>
    </section>
  );
}
