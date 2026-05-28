"use client";

import { useState, useTransition } from "react";
import { Pill } from "@/app/components/Pill";
import {
  STATUS_BODY_MAX_RICH,
  STATUS_BODY_MAX_SHIPPING_LOG,
  type StatusMode,
} from "@/lib/shipping-log";

export type StatusActionResponse =
  | { ok: true; sha: string }
  | { ok: false; error: string };

export interface StatusEditorActions {
  postStatus: (input: {
    week: string;
    body: string;
    mode: StatusMode;
  }) => Promise<StatusActionResponse>;
  editStatus: (input: {
    week: string;
    body: string;
    mode: StatusMode;
    sha: string;
  }) => Promise<StatusActionResponse>;
  deleteStatus: (input: {
    week: string;
    sha: string;
  }) => Promise<StatusActionResponse>;
}

export interface StatusEditorProps {
  week: string;
  current: { body: string; sha: string } | null;
  actions: StatusEditorActions;
}

type UiStatus = "idle" | "saving" | "ok" | "error";

function describeError(error: string): string {
  if (error === "sha_conflict") {
    return "Someone else updated this — refresh to see the latest.";
  }
  return `Error: ${error}`;
}

export function StatusEditor({
  week,
  current,
  actions,
}: StatusEditorProps): React.JSX.Element {
  // Default: Quick mode for new posts (lower friction). Rich mode for
  // edits (preserve whatever the existing body uses). When `current` is
  // present we don't know its mode from the prop — conservatively default
  // to Rich on edit.
  const initialMode: StatusMode = current ? "rich" : "shipping-log";

  const [mode, setMode] = useState<StatusMode>(initialMode);
  const [body, setBody] = useState(current?.body ?? "");
  const [sha, setSha] = useState<string | null>(current?.sha ?? null);
  const [status, setStatus] = useState<UiStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const save = (): void => {
    setStatus("saving");
    setMessage("Saving…");
    startTransition(async () => {
      const result = sha
        ? await actions.editStatus({ week, body, mode, sha })
        : await actions.postStatus({ week, body, mode });
      if (result.ok) {
        setStatus("ok");
        setMessage(sha ? "Updated" : "Posted");
        setSha(result.sha);
      } else {
        setStatus("error");
        setMessage(describeError(result.error));
      }
    });
  };

  // Takes sha as a parameter (rather than reading from state inside) so the
  // call site narrows null-vs-string at the boundary; the function body
  // stays branch-free. Delete button is only rendered when sha is truthy.
  const removeWithSha = (currentSha: string): void => {
    setStatus("saving");
    setMessage("Deleting…");
    startTransition(async () => {
      const result = await actions.deleteStatus({ week, sha: currentSha });
      if (result.ok) {
        setStatus("ok");
        setMessage("Deleted");
        setBody("");
        setSha(null);
      } else {
        setStatus("error");
        setMessage(describeError(result.error));
      }
    });
  };

  const submitDisabled = isPending || body.trim().length === 0;

  return (
    <form
      className="bg-paper border-l-[3px] border-l-ink px-4 py-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="flex items-center gap-2">
        <Pill
          variant={mode === "shipping-log" ? "solid" : "dashed"}
          type="button"
          onClick={() => setMode("shipping-log")}
        >
          Quick
        </Pill>
        <Pill
          variant={mode === "rich" ? "solid" : "dashed"}
          type="button"
          onClick={() => setMode("rich")}
        >
          Rich
        </Pill>
      </div>

      {mode === "shipping-log" ? (
        <>
          <label
            className="mt-4 block font-voice text-[11px] uppercase tracking-[1px] text-dust"
            htmlFor="status-body-quick"
          >
            Shipping log — 1 line, plain text ({week})
          </label>
          <input
            id="status-body-quick"
            type="text"
            maxLength={STATUS_BODY_MAX_SHIPPING_LOG}
            className="mt-2 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isPending}
          />
        </>
      ) : (
        <>
          <label
            className="mt-4 block font-voice text-[11px] uppercase tracking-[1px] text-dust"
            htmlFor="status-body-rich"
          >
            What are you working on this week ({week})?
          </label>
          <textarea
            id="status-body-rich"
            className="mt-2 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
            rows={4}
            maxLength={STATUS_BODY_MAX_RICH}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isPending}
          />
        </>
      )}

      <div className="mt-3 flex items-center gap-3">
        <Pill variant="solid" type="submit" disabled={submitDisabled}>
          {sha ? "Update" : "Post"}
        </Pill>
        {sha ? (
          <Pill
            variant="dashed"
            type="button"
            onClick={() => {
              removeWithSha(sha);
            }}
            disabled={isPending}
          >
            Delete
          </Pill>
        ) : null}
        {message ? (
          <span
            role="status"
            className={
              status === "error"
                ? "font-voice text-[11px] text-alert"
                : "font-voice text-[11px] text-dust"
            }
          >
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
