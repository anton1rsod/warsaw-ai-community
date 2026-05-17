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
