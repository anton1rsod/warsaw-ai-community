"use client";

import { useEffect, useState, useTransition } from "react";
import { saveProfile } from "@/app/actions/save-profile";
import { SafeHtml } from "@/app/components/SafeHtml";
import { Pill } from "@/app/components/Pill";

interface ProfileEditorProps {
  initialBody: string;
  // H16: SHA loaded at SSR time. Echoed back to the server action as an
  // optimistic-lock token so a concurrent commit between page-load and save
  // surfaces refresh_needed instead of silently overwriting the remote change.
  initialSha: string;
  slug: string;
  previewEndpoint: string;
  // v0.10.0: seeded from profile frontmatter so an existing opt-in
  // survives a profile save when the user didn't re-toggle the checkbox.
  initialTelegramEcho?: boolean;
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
  initialSha,
  slug,
  previewEndpoint,
  initialTelegramEcho = false,
}: ProfileEditorProps): React.JSX.Element {
  const [body, setBody] = useState<string>(initialBody);
  const [draftRestored, setDraftRestored] = useState<Date | null>(null);
  const [tab, setTab] = useState<Tab>("edit");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [telegramEcho, setTelegramEcho] = useState<boolean>(initialTelegramEcho);
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
    } catch {
      // Network error / fetch rejection — surface the same fallback as HTTP errors.
      setPreviewHtml("<p>Preview unavailable.</p>");
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
      fd.append("sha", initialSha);
      fd.append("telegramEcho", telegramEcho ? "true" : "false");
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
        <div className="mb-3 bg-cream-deep border-l-[3px] border-l-ink p-3 font-voice text-[11px] text-dust">
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

      <div role="tablist" className="flex gap-2 border-b border-ink/15">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "edit"}
          onClick={() => onTabChange("edit")}
          className={`border-b-2 px-3 py-2 text-sm font-voice ${tab === "edit" ? "border-ink text-ink" : "border-transparent text-dust"}`}
        >
          Edit
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "preview"}
          onClick={() => onTabChange("preview")}
          className={`border-b-2 px-3 py-2 text-sm font-voice ${tab === "preview" ? "border-ink text-ink" : "border-transparent text-dust"}`}
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
          className="mt-3 w-full resize-y bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      ) : (
        <div className="mt-3 min-h-[20rem] border-l-[2px] border-l-ink p-3">
          {previewLoading || previewHtml === null ? (
            <p className="font-voice text-[11px] text-dust">Loading preview…</p>
          ) : (
            <SafeHtml
              html={previewHtml}
              className="prose-warm max-w-none"
            />
          )}
        </div>
      )}

      <div className="mt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={telegramEcho}
            onChange={(e) => setTelegramEcho(e.target.checked)}
            className="h-4 w-4"
            disabled={save.kind === "saving"}
            aria-label="Telegram echo — auto-post my new /this-week statuses to the Subploters Telegram supergroup"
          />
          <span className="font-voice text-[12px] text-ink">
            Telegram echo — auto-post my new /this-week statuses to the Subploters Telegram supergroup
          </span>
        </label>
        <p className="mt-1 font-voice text-[11px] text-dust">
          Default off. Echoes preserve your handle + first 200 characters of the body + a link back. ADR-0016.
        </p>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Pill
          variant="solid"
          type="button"
          onClick={onSave}
          disabled={save.kind === "saving"}
        >
          {save.kind === "saving" ? "Saving…" : "Save"}
        </Pill>
        {save.kind === "saved" ? (
          <span className="font-voice text-[11px] text-dust">
            Saved. Your profile is rebuilding and will appear on /members/{slug}{" "}
            in ~60-90s after the next deploy completes.
          </span>
        ) : null}
        {save.kind === "error" ? (
          <span className="font-voice text-[11px] text-alert">
            {save.message}
          </span>
        ) : null}
      </div>
    </section>
  );
}
