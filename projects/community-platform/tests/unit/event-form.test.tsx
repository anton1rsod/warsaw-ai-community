import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import { EventForm } from "@/app/components/EventForm";

afterEach(() => {
  cleanup();
  push.mockReset();
});

const defaults = {
  startTime: "18:00",
  durationMinutes: 120,
  location: "Grzybowska 85a, Warsaw",
  host: "anton1rsod",
  today: "2026-05-28",
};

describe("EventForm — render + defaults", () => {
  it("renders all fields with defaults pre-filled", () => {
    render(<EventForm action={vi.fn()} defaults={defaults} />);
    expect(screen.getByLabelText(/title/i)).toBeTruthy();
    expect((screen.getByLabelText(/date/i) as HTMLInputElement).value).toBe(
      "2026-05-28",
    );
    expect(
      (screen.getByLabelText(/start time/i) as HTMLInputElement).value,
    ).toBe("18:00");
    expect(
      (screen.getByLabelText(/duration/i) as HTMLInputElement).value,
    ).toBe("120");
    expect(
      (screen.getByLabelText(/location/i) as HTMLInputElement).value,
    ).toBe("Grzybowska 85a, Warsaw");
    expect((screen.getByLabelText(/host/i) as HTMLInputElement).value).toBe(
      "anton1rsod",
    );
    expect(screen.getByRole("button", { name: /create event/i })).toBeTruthy();
  });

  it("leaves slug placeholder empty when title is blank", () => {
    render(<EventForm action={vi.fn()} defaults={defaults} />);
    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
    expect(slugInput.placeholder).toBe("");
  });
});

describe("EventForm — live slug derivation", () => {
  it("derives slug live from title + date", () => {
    render(<EventForm action={vi.fn()} defaults={defaults} />);
    const title = screen.getByLabelText(/title/i) as HTMLInputElement;
    fireEvent.change(title, { target: { value: "Meetup #5" } });
    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
    expect(slugInput.placeholder).toBe("2026-05-28-meetup-5");
  });
});

describe("EventForm — submit", () => {
  it("calls action and pushes to /events/<slug> on success", async () => {
    const action = vi
      .fn()
      .mockResolvedValue({ ok: true, slug: "2026-05-28-x" });
    render(<EventForm action={action} defaults={defaults} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "X" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create event/i }));

    await vi.waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith("/events/2026-05-28-x");
    });
  });

  it("shows error inline when action returns ok:false (slug_exists)", async () => {
    const action = vi
      .fn()
      .mockResolvedValue({ ok: false, error: "slug_exists" });
    render(<EventForm action={action} defaults={defaults} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "X" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create event/i }));

    await vi.waitFor(() => {
      expect(
        screen.getByText(/an event with that slug already exists/i),
      ).toBeTruthy();
    });
  });
});

describe("EventForm — preview button (O2 lock)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ html: "<p>rendered</p>" }), {
          status: 200,
        }),
      ),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders preview HTML when Preview clicked", async () => {
    render(<EventForm action={vi.fn()} defaults={defaults} />);
    fireEvent.click(screen.getByRole("button", { name: /^preview$/i }));

    await vi.waitFor(() => {
      expect(
        screen.getByTestId("event-body-preview").innerHTML,
      ).toContain("rendered");
    });
  });

  it("hides preview on second click", async () => {
    render(<EventForm action={vi.fn()} defaults={defaults} />);
    fireEvent.click(screen.getByRole("button", { name: /^preview$/i }));
    await vi.waitFor(() => screen.getByTestId("event-body-preview"));
    fireEvent.click(screen.getByRole("button", { name: /hide preview/i }));
    expect(screen.queryByTestId("event-body-preview")).toBeNull();
  });
});
