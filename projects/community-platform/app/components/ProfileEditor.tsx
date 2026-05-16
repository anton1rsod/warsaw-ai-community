"use client";

import { useEffect, useState, useTransition } from "react";
import { saveProfile } from "@/app/actions/save-profile";
import { SafeHtml } from "@/app/components/SafeHtml";

interface ProfileEditorProps {
  initialBody: string;
  slug: string;
  previewEndpoint: string;
}

type Tab = "edit" | "preview";

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

function draftKey(slug: string): string {
  return `warsaw-profile-draft-${slug}`;
}

interface Draft {
  body: string;
  at: number;
}

function readDraft(slug: string): Draft | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(draftKey(slug));
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Draft;
    if (typeof d.body === "string" && typeof d.at === "number") return d;
  } catch {
    // fall through — corrupt JSON, ignore
  }
  return null;
}

function writeDraft(slug: string, body: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    draftKey(slug),
    JSON.stringify({ body, at: Date.now() }),
  );
}

function clearDraft(slug: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(draftKey(slug));
}

export function ProfileEditor({
  initialBody,
  slug,
  previewEndpoint,
}: ProfileEditorProps): React.JSX.Element {
  const [body, setBody] = useState<string>(initialBody);
  const [draftRestored, setDraftRestored] = useState<Date | null>(null);
  const [tab, setTab] = useState<Tab>("edit");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [, startTransition] = useTransition();

  // Restore draft on mount. Only show the banner when the draft differs from
  // the server-side initialBody (i.e. there is actually unsaved local work).
  useEffect(() => {
    const d = readDraft(slug);
    if (d && d.body !== initialBody) {
      setBody(d.body);
      setDraftRestored(new Date(d.at));
    }
  }, [slug, initialBody]);

  // Persist draft on every body change. Clear when body matches server state.
  useEffect(() => {
    if (body === initialBody) {
      clearDraft(slug);
      return;
    }
    writeDraft(slug, body);
  }, [slug, initialBody, body]);

  async function loadPreview(): Promise<void> {
    setPreviewLoading(true);
    setPreviewHtml(null);
    try {
      const res = await fetch(previewEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        const json = (await res.json()) as { html: string };
        setPreviewHtml(json.html);
      } else {
        setPreviewHtml("<p>Preview unavailable.</p>");
      }
    } finally {
      setPreviewLoading(false);
    }
  }

  function onTabChange(t: Tab): void {
    setTab(t);
    if (t === "preview") void loadPreview();
  }

  function onSave(): void {
    setSave({ kind: "saving" });
    startTransition(async () => {
      const fd = new FormData();
      fd.append("body", body);
      const result = await saveProfile(fd);
      if (result.ok) {
        clearDraft(slug);
        setDraftRestored(null);
        setSave({ kind: "saved" });
      } else {
        const msg =
          result.error === "refresh_needed"
            ? "Someone else updated this — refresh to see the latest."
            : `Save failed (${result.error}).`;
        setSave({ kind: "error", message: msg });
      }
    });
  }

  function onDiscard(): void {
    clearDraft(slug);
    setDraftRestored(null);
    setBody(initialBody);
  }

  return (
    <section className="mt-6">
      {draftRestored ? (
        <div className="mb-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950">
          Restored draft from {draftRestored.toLocaleString()}.{" "}
          <button
            type="button"
            onClick={onDiscard}
            className="underline"
          >
            Discard draft
          </button>
        </div>
      ) : null}

      <div role="tablist" className="flex gap-2 border-b">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "edit"}
          onClick={() => onTabChange("edit")}
          className={`border-b-2 px-3 py-2 text-sm ${tab === "edit" ? "border-current" : "border-transparent"}`}
        >
          Edit
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "preview"}
          onClick={() => onTabChange("preview")}
          className={`border-b-2 px-3 py-2 text-sm ${tab === "preview" ? "border-current" : "border-transparent"}`}
        >
          Preview
        </button>
      </div>

      {tab === "edit" ? (
        <textarea
          aria-label="Profile prose (markdown)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={20}
          className="mt-3 w-full resize-y rounded border p-3 font-mono text-sm"
        />
      ) : (
        <div className="mt-3 min-h-[20rem] rounded border p-3">
          {previewLoading ? (
            <p className="text-sm text-neutral-500">Loading preview…</p>
          ) : previewHtml ? (
            <SafeHtml
              html={previewHtml}
              className="prose prose-neutral dark:prose-invert max-w-none"
            />
          ) : (
            <p className="text-sm text-neutral-500">Click Preview to render.</p>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={save.kind === "saving"}
          className="rounded border bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {save.kind === "saving" ? "Saving…" : "Save"}
        </button>
        {save.kind === "saved" ? (
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Saved. Your profile is rebuilding and will appear on /members/{slug}{" "}
            in ~60-90s after the next deploy completes.
          </span>
        ) : null}
        {save.kind === "error" ? (
          <span className="text-sm text-red-700 dark:text-red-400">
            {save.message}
          </span>
        ) : null}
      </div>
    </section>
  );
}
