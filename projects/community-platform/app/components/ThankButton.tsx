"use client";

import { useState, useTransition } from "react";
import { thankStatus } from "@/app/actions/thank-status";

type State = "thanked" | "not-thanked" | "not-signed-in" | "self";

interface ThankButtonProps {
  recipient: string;
  itemType: "status" | "contribution" | "meeting";
  itemId: string;
  initialState: State;
  profileSha?: string;
}

export function ThankButton({
  recipient,
  itemType,
  itemId,
  initialState,
  profileSha,
}: ThankButtonProps): React.JSX.Element | null {
  const [state, setState] = useState<State>(initialState);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (state === "self") return null;

  if (state === "not-signed-in") {
    return (
      <a
        href="/login?callbackUrl=/this-week"
        className="text-xs text-neutral-500 hover:underline"
      >
        Sign in to thank
      </a>
    );
  }

  function submit(): void {
    if (state === "thanked") return;
    if (!profileSha) return;
    setErrMsg(null);
    setState("thanked");
    startTransition(async () => {
      const r = await thankStatus({
        recipient,
        item_type: itemType,
        item_id: itemId,
        profileSha,
      });
      if (!r.ok) {
        setState("not-thanked");
        if (r.error === "refresh_needed") {
          setErrMsg("Refresh and try again.");
        } else {
          setErrMsg("Could not save — try again.");
        }
      }
      // ok=true (including already_thanked=true): stay in "thanked"
    });
  }

  return (
    <span className="inline-block">
      <button
        type="button"
        onClick={submit}
        disabled={isPending || state === "thanked"}
        className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
          state === "thanked"
            ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
            : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
        }`}
      >
        {state === "thanked" ? "♥ Thanked" : "+ Thanks"}
      </button>
      {errMsg ? (
        <span className="ml-2 text-xs text-red-700 dark:text-red-300">
          {errMsg}
        </span>
      ) : null}
    </span>
  );
}
