"use client";

import { useState, useTransition } from "react";

export type StatusActionResponse =
  | { ok: true; sha: string }
  | { ok: false; error: string };

export interface StatusEditorActions {
  postStatus: (input: {
    week: string;
    body: string;
  }) => Promise<StatusActionResponse>;
  editStatus: (input: {
    week: string;
    body: string;
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
        ? await actions.editStatus({ week, body, sha })
        : await actions.postStatus({ week, body });
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
      className="rounded border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label className="block text-sm font-medium" htmlFor="status-body">
        What are you working on this week ({week})?
      </label>
      <textarea
        id="status-body"
        className="mt-2 block w-full rounded border p-2 font-mono text-sm"
        rows={4}
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
        }}
        disabled={isPending}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          disabled={submitDisabled}
        >
          {sha ? "Update" : "Post"}
        </button>
        {sha ? (
          <button
            type="button"
            onClick={() => {
              removeWithSha(sha);
            }}
            className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-900"
            disabled={isPending}
          >
            Delete
          </button>
        ) : null}
        {message ? (
          <span
            role="status"
            className={
              status === "error"
                ? "text-sm text-red-600 dark:text-red-400"
                : "text-sm text-neutral-600 dark:text-neutral-400"
            }
          >
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
