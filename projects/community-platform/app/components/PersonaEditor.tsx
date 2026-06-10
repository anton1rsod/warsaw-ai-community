"use client";

import { useState, useTransition } from "react";
import { savePersona } from "@/app/actions/save-persona";
import { Pill } from "@/app/components/Pill";
import { MonoLabel } from "@/app/components/MonoLabel";
import { s } from "@/lib/i18n/strings";
import { PERSONA_MAX_BYTES as MAX } from "@/lib/persona-editor";

export function PersonaEditor({
  initialContent,
  slug: _slug,
}: {
  initialContent: string;
  /** Member slug — reserved for future use (e.g., pre-validation hint). Not sent to the action; the action derives slug from the session. */
  slug: string;
}): React.JSX.Element {
  const [content, setContent] = useState(initialContent);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();
  const tooLarge = content.length > MAX;
  const empty = content.trim().length === 0;

  function onFile(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX) { setState("error"); return; } // H141: client cap; filename unused
    void file.text().then((t) => setContent(t)).catch(() => setState("error"));
  }

  function onAttach(): void {
    if (tooLarge || empty) return;
    setState("saving");
    startTransition(async () => {
      const f = new FormData();
      f.append("content", content);
      const res = await savePersona(f);
      setState(res.ok ? "saved" : "error");
    });
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

      <div className="mt-3 flex items-center gap-3">
        <Pill variant="solid" type="button" onClick={onAttach} disabled={empty || tooLarge || state === "saving"}>
          {state === "saving" ? "Attaching…" : s("persona.editor.attach")}
        </Pill>
        {state === "saved" ? (
          <span className="font-voice text-[11px] text-dust">Attached — your card rebuilds in ~60-90s after the next deploy.</span>
        ) : null}
        {state === "error" ? (
          <span className="font-voice text-[11px] text-alert">Couldn&apos;t attach — check valid frontmatter (persona_id = your slug) and size under 64KB.</span>
        ) : null}
      </div>
    </section>
  );
}
