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
        className="inline-block border-[1.5px] border-solid border-ink text-ink font-voice font-bold text-[10px] px-3 py-1 hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream"
      >
        Sign in to RSVP
      </a>
    );
  }

  function submit(desiredState: DesiredState): void {
    if (!profileSha) return;
    const prior = state;
    setErrMsg(null);
    setState(desiredState);
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
          className={
            goingActive
              ? "bg-ink text-cream font-voice font-bold text-[10px] px-3 py-1 hover:bg-accent-500 hover:text-ink focus-visible:bg-accent-500 focus-visible:text-ink"
              : "border-[1.5px] border-ink text-ink font-voice font-bold text-[10px] px-3 py-1 hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream"
          }
        >
          {goingActive ? "✓ Going" : "Going"}
        </button>
        <button
          type="button"
          onClick={onInterested}
          disabled={isPending}
          className={
            interestedActive
              ? "bg-ink text-cream font-voice font-bold text-[10px] px-3 py-1 hover:bg-accent-500 hover:text-ink focus-visible:bg-accent-500 focus-visible:text-ink"
              : "border-[1.5px] border-ink text-ink font-voice font-bold text-[10px] px-3 py-1 hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream"
          }
        >
          {interestedActive ? "★ Interested" : "Interested"}
        </button>
      </div>
      {errMsg ? <p className="text-sm text-red-700 dark:text-red-300">{errMsg}</p> : null}
    </div>
  );
}
