import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockAction = vi.fn();
vi.mock("@/app/actions/rsvp-event", () => ({
  rsvpEvent: (...args: unknown[]) => mockAction(...args),
}));

import { EventRsvpButton } from "@/app/components/EventRsvpButton";

beforeEach(() => {
  mockAction.mockReset();
});
afterEach(cleanup);

describe("D10 + D11: EventRsvpButton tri-state transitions", () => {
  it("renders Going + Interested buttons; both inactive when state='none'", () => {
    render(
      <EventRsvpButton
        eventSlug="x"
        initialState="none"
        profileSha="abc"
      />,
    );
    expect(screen.getByRole("button", { name: /Going/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Interested/ })).toBeInTheDocument();
  });

  it("click Going from none → optimistic active; calls rsvpEvent with desiredState=going", async () => {
    mockAction.mockResolvedValue({ ok: true, state: "going" });
    render(
      <EventRsvpButton
        eventSlug="x"
        initialState="none"
        profileSha="abc"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Going/ }));
    await waitFor(() =>
      expect(mockAction).toHaveBeenCalledWith({
        eventSlug: "x",
        desiredState: "going",
        profileSha: "abc",
      }),
    );
  });

  it("state='going' + click Going → desiredState=none (toggle off)", async () => {
    mockAction.mockResolvedValue({ ok: true, state: "none" });
    render(
      <EventRsvpButton
        eventSlug="x"
        initialState="going"
        profileSha="abc"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /✓ Going/ }));
    await waitFor(() =>
      expect(mockAction).toHaveBeenCalledWith({
        eventSlug: "x",
        desiredState: "none",
        profileSha: "abc",
      }),
    );
  });

  it("state='going' + click Interested → desiredState=interested (atomic switch)", async () => {
    mockAction.mockResolvedValue({ ok: true, state: "interested" });
    render(
      <EventRsvpButton
        eventSlug="x"
        initialState="going"
        profileSha="abc"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Interested/ }));
    await waitFor(() =>
      expect(mockAction).toHaveBeenCalledWith({
        eventSlug: "x",
        desiredState: "interested",
        profileSha: "abc",
      }),
    );
  });

  it("state='interested' + click Interested → desiredState=none", async () => {
    mockAction.mockResolvedValue({ ok: true, state: "none" });
    render(
      <EventRsvpButton
        eventSlug="x"
        initialState="interested"
        profileSha="abc"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /★ Interested/ }));
    await waitFor(() =>
      expect(mockAction).toHaveBeenCalledWith({
        eventSlug: "x",
        desiredState: "none",
        profileSha: "abc",
      }),
    );
  });

  it("not-signed-in → renders sign-in CTA with callbackUrl", () => {
    render(<EventRsvpButton eventSlug="x" initialState="not-signed-in" />);
    expect(
      screen.getByRole("link", { name: /Sign in to RSVP/i }),
    ).toHaveAttribute("href", "/login?callbackUrl=/events/x");
  });

  it("missing profileSha → click is a no-op (no action call)", () => {
    render(<EventRsvpButton eventSlug="x" initialState="none" />);
    fireEvent.click(screen.getByRole("button", { name: /Going/ }));
    expect(mockAction).not.toHaveBeenCalled();
  });
});

describe("v0.4.7: EventRsvpButton mount-time hydration via /api/event-rsvp-state", () => {
  // /events/[slug] is force-static SSG (O6 lock) — page HTML ships with
  // initialState="not-signed-in" for everyone. On mount, the button polls
  // /api/event-rsvp-state to recover the signed-in viewer's real state +
  // profileSha. Anonymous visitors stay on the sign-in CTA.

  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
  });

  it("on mount with initialState='not-signed-in', calls /api/event-rsvp-state with the slug", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ state: "none", profileSha: "abc" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    render(
      <EventRsvpButton
        eventSlug="2026-05-21-meetup-4"
        initialState="not-signed-in"
      />,
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/event-rsvp-state?slug=2026-05-21-meetup-4",
        expect.objectContaining({ credentials: "same-origin" }),
      ),
    );
  });

  it("on 200 with state=going, flips to active Going button (no more sign-in link)", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ state: "going", profileSha: "abc" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof global.fetch;

    render(
      <EventRsvpButton
        eventSlug="2026-05-21-meetup-4"
        initialState="not-signed-in"
      />,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /✓ Going/ }),
      ).toBeInTheDocument(),
    );
    // Sign-in link no longer present.
    expect(screen.queryByRole("link", { name: /Sign in to RSVP/i })).toBeNull();
  });

  it("on 200 with state=none, shows inactive Going + Interested buttons", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ state: "none", profileSha: "abc" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof global.fetch;

    render(
      <EventRsvpButton
        eventSlug="2026-05-21-meetup-4"
        initialState="not-signed-in"
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Going$/ })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /^Interested$/ })).toBeInTheDocument();
  });

  it("after hydration, clicking Going uses the hydrated profileSha", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ state: "none", profileSha: "hydrated-sha" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof global.fetch;
    mockAction.mockResolvedValue({ ok: true, state: "going" });

    render(
      <EventRsvpButton
        eventSlug="2026-05-21-meetup-4"
        initialState="not-signed-in"
      />,
    );

    const goingBtn = await screen.findByRole("button", { name: /^Going$/ });
    fireEvent.click(goingBtn);

    await waitFor(() =>
      expect(mockAction).toHaveBeenCalledWith({
        eventSlug: "2026-05-21-meetup-4",
        desiredState: "going",
        profileSha: "hydrated-sha",
      }),
    );
  });

  it("on 401, stays on Sign-in CTA (anon flow)", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "not_authenticated" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof global.fetch;

    render(
      <EventRsvpButton
        eventSlug="2026-05-21-meetup-4"
        initialState="not-signed-in"
      />,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: /Sign in to RSVP/i }),
      ).toBeInTheDocument(),
    );
    // No Going/Interested buttons rendered.
    expect(screen.queryByRole("button", { name: /Going/ })).toBeNull();
  });

  it("on network failure, stays on Sign-in CTA (defensive)", async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValue(new Error("offline")) as unknown as typeof global.fetch;

    render(
      <EventRsvpButton
        eventSlug="2026-05-21-meetup-4"
        initialState="not-signed-in"
      />,
    );

    // Sign-in link present synchronously (initial render) and stays after
    // the rejected fetch resolves.
    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: /Sign in to RSVP/i }),
      ).toBeInTheDocument(),
    );
  });

  it("on 200 with literal null body, stays on Sign-in CTA", async () => {
    // Defensive: Response.json() returns null for a `null` JSON body.
    // Covers the `v === null` short-circuit in the hydration type guard.
    global.fetch = vi.fn().mockResolvedValue(
      new Response("null", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof global.fetch;

    render(
      <EventRsvpButton
        eventSlug="2026-05-21-meetup-4"
        initialState="not-signed-in"
      />,
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(
      screen.getByRole("link", { name: /Sign in to RSVP/i }),
    ).toBeInTheDocument();
  });

  it("on 200 with malformed payload (wrong shape), stays on Sign-in CTA", async () => {
    // Guard against schema drift — if the API ever returns an unexpected
    // shape, the button must not crash or render a half-state.
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ unexpected: "shape" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as unknown as typeof global.fetch;

    render(
      <EventRsvpButton
        eventSlug="2026-05-21-meetup-4"
        initialState="not-signed-in"
      />,
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(
      screen.getByRole("link", { name: /Sign in to RSVP/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Going/ })).toBeNull();
  });

  it("with initialState !== 'not-signed-in', does NOT fetch (no double hydration)", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof global.fetch;

    render(
      <EventRsvpButton
        eventSlug="2026-05-21-meetup-4"
        initialState="going"
        profileSha="server-sha"
      />,
    );

    // Wait a tick for any unintended useEffect side-effects to fire.
    await new Promise((r) => setTimeout(r, 20));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("EventRsvpButton: 409 revert + refresh message", () => {
  it("on refresh_needed, reverts optimistic state and shows refresh message", async () => {
    mockAction.mockResolvedValue({ ok: false, error: "refresh_needed" });
    render(
      <EventRsvpButton
        eventSlug="x"
        initialState="none"
        profileSha="abc"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Going/ }));
    await waitFor(() =>
      expect(screen.getByText(/refresh and try again/i)).toBeInTheDocument(),
    );
    // Going button is back to inactive label.
    expect(screen.getByRole("button", { name: /^Going$/i })).toBeInTheDocument();
  });

  it("on other error, shows generic try-again message", async () => {
    mockAction.mockResolvedValue({ ok: false, error: "internal_error" });
    render(
      <EventRsvpButton
        eventSlug="x"
        initialState="none"
        profileSha="abc"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Going/ }));
    await waitFor(() =>
      expect(screen.getByText(/Could not save RSVP/i)).toBeInTheDocument(),
    );
  });
});
