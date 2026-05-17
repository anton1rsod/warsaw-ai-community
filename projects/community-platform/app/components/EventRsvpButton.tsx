"use client";

import { useState, useTransition } from "react";
import { rsvpEvent } from "@/app/actions/rsvp-event";

type State = "going" | "interested" | "none" | "not-signed-in";
type DesiredState = "going" | "interested" | "none";

interface EventRsvpButtonProps {
  eventSlug: string;
  initialState: State;
  profileSha?: string;
}

export function EventRsvpButton({
  eventSlug,
  initialState,
  profileSha,
}: EventRsvpButtonProps): React.JSX.Element {
  const [state, setState] = useState<State>(initialState);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (state === "not-signed-in") {
    return (
      <a
        href={`/login?callbackUrl=/events/${eventSlug}`}
        className="inline-block rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
      >
        Sign in to RSVP
      </a>
    );
  }

  function submit(desiredState: DesiredState): void {
    if (!profileSha) return;
    const prior = state;
    setErrMsg(null);
    setState(desiredState as State);
    startTransition(async () => {
      const r = await rsvpEvent({ eventSlug, desiredState, profileSha });
      if (!r.ok) {
        setState(prior);
        if (r.error === "refresh_needed") {
          setErrMsg("Someone else updated your profile — refresh and try again.");
        } else {
          setErrMsg("Could not save RSVP — please try again.");
        }
      }
    });
  }

  function onGoing(): void {
    submit(state === "going" ? "none" : "going");
  }
  function onInterested(): void {
    submit(state === "interested" ? "none" : "interested");
  }

  const goingActive = state === "going";
  const interestedActive = state === "interested";

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onGoing}
          disabled={isPending}
          className={`rounded px-3 py-1.5 text-sm font-medium transition ${
            goingActive
              ? "bg-green-600 text-white hover:bg-green-700"
              : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
          }`}
        >
          {goingActive ? "✓ Going" : "Going"}
        </button>
        <button
          type="button"
          onClick={onInterested}
          disabled={isPending}
          className={`rounded px-3 py-1.5 text-sm font-medium transition ${
            interestedActive
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
          }`}
        >
          {interestedActive ? "★ Interested" : "Interested"}
        </button>
      </div>
      {errMsg ? <p className="text-sm text-red-700 dark:text-red-300">{errMsg}</p> : null}
    </div>
  );
}
