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
        className="font-voice text-[10px] text-dust underline underline-offset-2 hover:text-ink"
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
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={submit}
        disabled={isPending || state === "thanked"}
        className={`min-h-[24px] inline-flex items-center px-[11px] py-[4px] font-voice font-bold text-[10px] transition-colors duration-150 ${
          state === "thanked"
            ? "bg-accent-50 text-accent-700 border-[1.5px] border-solid border-accent-700"
            : "border-[1.5px] border-dashed border-ink text-ink bg-transparent hover:bg-ink hover:text-cream"
        }`}
      >
        {state === "thanked" ? "♥ Thanked" : "+ Thanks"}
      </button>
      {errMsg ? (
        <span className="font-voice text-[10px] text-alert">{errMsg}</span>
      ) : null}
    </span>
  );
}
