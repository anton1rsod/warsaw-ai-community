"use client";

import { useEffect, useState, useTransition } from "react";
import { rsvpEvent } from "@/app/actions/rsvp-event";

type State = "going" | "interested" | "none" | "not-signed-in";
type DesiredState = "going" | "interested" | "none";

interface EventRsvpButtonProps {
  eventSlug: string;
  initialState: State;
  profileSha?: string;
}

interface HydrationResponse {
  state: "going" | "interested" | "none";
  profileSha: string;
}

function isHydrationResponse(v: unknown): v is HydrationResponse {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    (o.state === "going" || o.state === "interested" || o.state === "none") &&
    typeof o.profileSha === "string" &&
    o.profileSha.length > 0
  );
}

export function EventRsvpButton({
  eventSlug,
  initialState,
  profileSha: initialSha,
}: EventRsvpButtonProps): React.JSX.Element {
  const [state, setState] = useState<State>(initialState);
  const [profileSha, setProfileSha] = useState<string | undefined>(initialSha);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // v0.4.7 hydration — /events/[slug] is force-static SSG (O6 lock), so the
  // server-rendered HTML always ships `initialState="not-signed-in"`. On
  // mount, a signed-in client recovers the real RSVP state + profileSha
  // from /api/event-rsvp-state. Anonymous clients receive 401 and stay on
  // the sign-in CTA. Only fires when we actually need hydration — once we
  // have a real state from the server (initialState !== "not-signed-in"),
  // there's nothing to recover.
  useEffect(() => {
    if (initialState !== "not-signed-in") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/event-rsvp-state?slug=${encodeURIComponent(eventSlug)}`,
          { credentials: "same-origin" },
        );
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (!cancelled && isHydrationResponse(data)) {
          setState(data.state);
          setProfileSha(data.profileSha);
        }
      } catch {
        // Network failure or aborted — leave the Sign-in CTA in place.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventSlug, initialState]);

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
