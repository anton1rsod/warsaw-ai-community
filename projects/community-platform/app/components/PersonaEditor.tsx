"use client";

import { useState, useTransition } from "react";
import { resyncPersona } from "@/app/actions/resync-persona";
import { savePersona } from "@/app/actions/save-persona";
import { Pill } from "@/app/components/Pill";
import { MonoLabel } from "@/app/components/MonoLabel";
import { s } from "@/lib/i18n/strings";
import {
  PERSONA_MAX_BYTES as MAX,
  type PersonaSaveError,
  type PersonaSaveResult,
} from "@/lib/persona-editor";

type EditorStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; error: PersonaSaveError | "client" };

// Per-kind messages for the H151/H152 fetch path; everything else keeps the
// generic frontmatter/size hint.
function errorMessage(error: PersonaSaveError | "client"): string {
  switch (error) {
    case "invalid_url":
      return s("persona.editor.errInvalidUrl");
    case "fetch_failed":
      return s("persona.editor.errFetch");
    case "fetch_too_large":
      return s("persona.editor.errTooLarge");
    default:
      return s("persona.editor.errGeneric");
  }
}

export function PersonaEditor({
  initialContent,
  slug: _slug,
  initialSourceUrl = null,
}: {
  initialContent: string;
  /** Member slug — reserved for future use (e.g., pre-validation hint). Not sent to the action; the action derives slug from the session. */
  slug: string;
  /** O4: persona_source_url from the profile frontmatter; non-null shows the Re-sync pill. */
  initialSourceUrl?: string | null;
}): React.JSX.Element {
  const [content, setContent] = useState(initialContent);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl ?? "");
  const [status, setStatus] = useState<EditorStatus>({ kind: "idle" });
  const [, startTransition] = useTransition();
  // H152 parity: byte-accurate client check (matches SavePersonaSchema's TextEncoder refinement).
  const tooLarge = new TextEncoder().encode(content).length > MAX;
  const empty = content.trim().length === 0;
  const saving = status.kind === "saving";

  function onFile(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX) {
      setStatus({ kind: "error", error: "client" }); // H141: client cap; filename unused
      return;
    }
    void file
      .text()
      .then((t) => setContent(t))
      .catch(() => setStatus({ kind: "error", error: "client" }));
  }

  function run(action: () => Promise<PersonaSaveResult>): void {
    setStatus({ kind: "saving" });
    startTransition(async () => {
      const res = await action();
      setStatus(res.ok ? { kind: "saved" } : { kind: "error", error: res.error });
    });
  }

  function onAttach(): void {
    if (tooLarge || empty) return;
    run(() => {
      const f = new FormData();
      f.append("content", content);
      return savePersona(f);
    });
  }

  function onFetchAttach(): void {
    if (sourceUrl.trim().length === 0) return;
    run(() => {
      const f = new FormData();
      f.append("source_url", sourceUrl.trim());
      return savePersona(f);
    });
  }

  function onResync(): void {
    run(() => resyncPersona());
  }

  return (
    <section className="mt-8 border-[1.5px] border-ink p-4">
      <MonoLabel as="h2">{s("persona.editor.heading")}</MonoLabel>
      <p className="mt-2 font-voice text-[12px] text-ink">{s("persona.editor.help")}</p>
      <p className="mt-2 bg-cream-deep border-l-[3px] border-l-ink p-3 font-voice text-[11px] text-dust">
        {s("persona.editor.consent")}
      </p>
      <p className="mt-2 font-voice text-[11px] text-dust">{s("persona.editor.dataMin")}</p>

      <textarea
        aria-label="Persona markdown"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={16}
        className="mt-3 w-full resize-y bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
      <input
        type="file"
        accept=".md,.markdown"
        onChange={onFile}
        className="mt-2 block font-voice text-[11px] text-dust"
        aria-label="Upload persona .md file"
      />
      {tooLarge ? (
        <p className="mt-2 font-voice text-[11px] text-alert">{s("persona.editor.tooLarge")}</p>
      ) : null}

      <div className="mt-4">
        <label htmlFor="persona-source-url" className="block font-voice text-[11px] text-dust">
          {s("persona.editor.urlLabel")}
        </label>
        <input
          id="persona-source-url"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder={s("persona.editor.urlPlaceholder")}
          className="mt-1 w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Pill
          variant="solid"
          type="button"
          onClick={onAttach}
          disabled={empty || tooLarge || saving}
        >
          {saving ? s("persona.editor.attaching") : s("persona.editor.attach")}
        </Pill>
        <Pill
          variant="solid"
          type="button"
          onClick={onFetchAttach}
          disabled={sourceUrl.trim().length === 0 || saving}
        >
          {s("persona.editor.fetchAttach")}
        </Pill>
        {initialSourceUrl !== null ? (
          <Pill variant="dashed" type="button" onClick={onResync} disabled={saving}>
            {s("persona.editor.resync")}
          </Pill>
        ) : null}
        {status.kind === "saved" ? (
          <span className="font-voice text-[11px] text-dust">{s("persona.editor.attached")}</span>
        ) : null}
        {status.kind === "error" ? (
          <span className="font-voice text-[11px] text-alert">{errorMessage(status.error)}</span>
        ) : null}
      </div>
    </section>
  );
}
