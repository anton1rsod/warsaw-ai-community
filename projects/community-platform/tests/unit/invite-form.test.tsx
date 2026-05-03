import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InviteForm } from "@/app/components/InviteForm";

afterEach(cleanup);

describe("InviteForm", () => {
  it("renders hint_telegram + hint_display_name inputs", () => {
    render(<InviteForm action={vi.fn()} />);
    expect(screen.getByLabelText(/telegram hint/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name hint/i)).toBeInTheDocument();
  });
  it("submits the form via the action prop", async () => {
    const action = vi.fn().mockResolvedValue({ url: "https://example.com/onboard?token=x" });
    render(<InviteForm action={action} />);
    fireEvent.change(screen.getByLabelText(/telegram hint/i), {
      target: { value: "@invitee" },
    });
    fireEvent.click(screen.getByRole("button", { name: /mint/i }));
    await waitFor(() => expect(action).toHaveBeenCalled());
  });
  it("displays the returned URL via InviteUrlDisplay after a successful mint", async () => {
    const action = vi
      .fn()
      .mockResolvedValue({ url: "https://example.com/onboard?token=abc" });
    render(<InviteForm action={action} />);
    fireEvent.change(screen.getByLabelText(/telegram hint/i), {
      target: { value: "@invitee" },
    });
    fireEvent.click(screen.getByRole("button", { name: /mint/i }));
    await waitFor(() => {
      expect(screen.getByDisplayValue(/abc$/)).toBeInTheDocument();
    });
  });
  it("shows an error message when the action returns an error", async () => {
    const action = vi.fn().mockResolvedValue({ error: "Mint failed: invalid input" });
    render(<InviteForm action={action} />);
    fireEvent.click(screen.getByRole("button", { name: /mint/i }));
    await waitFor(() => {
      expect(screen.getByText(/mint failed/i)).toBeInTheDocument();
    });
  });
  it("shows fallback error when the action throws", async () => {
    const action = vi.fn().mockRejectedValue(new Error("network down"));
    render(<InviteForm action={action} />);
    fireEvent.click(screen.getByRole("button", { name: /mint/i }));
    await waitFor(() => {
      expect(screen.getByText(/mint failed/i)).toBeInTheDocument();
    });
  });
});
