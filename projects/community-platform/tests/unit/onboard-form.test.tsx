import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OnboardForm } from "@/app/components/OnboardForm";

afterEach(cleanup);

describe("OnboardForm", () => {
  it("renders all required fields (display_name, telegram, git_email_alias, consent_accepted)", () => {
    render(<OnboardForm action={vi.fn()} hintTelegram={null} />);
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telegram handle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/git email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i agree/i)).toBeInTheDocument();
  });

  it("renders soft-binding banner when hintTelegram is present", () => {
    render(<OnboardForm action={vi.fn()} hintTelegram="@antonsafronov" />);
    expect(
      screen.getByText(/this invitation was issued to/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/@antonsafronov/)).toBeInTheDocument();
    expect(
      screen.getByText(/if that.?s not you, please don.?t proceed/i),
    ).toBeInTheDocument();
  });

  it("does NOT render the banner when hintTelegram is null", () => {
    render(<OnboardForm action={vi.fn()} hintTelegram={null} />);
    expect(screen.queryByText(/this invitation was issued to/i)).toBeNull();
  });

  it("submits via the action prop", async () => {
    const action = vi.fn().mockResolvedValue({ ok: true });
    const { container } = render(
      <OnboardForm action={action} hintTelegram={null} />,
    );
    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/telegram handle/i), {
      target: { value: "@testuser" },
    });
    fireEvent.change(screen.getByLabelText(/git email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByLabelText(/i agree/i));
    const form = container.querySelector("form");
    if (!form) throw new Error("form not found");
    fireEvent.submit(form);
    await waitFor(() => expect(action).toHaveBeenCalled());
  });

  it("disables submit button while submitting", async () => {
    const neverResolve = vi.fn(
      (): Promise<{ ok?: boolean; error?: string }> =>
        new Promise<{ ok?: boolean; error?: string }>(() => undefined),
    );
    const { container } = render(
      <OnboardForm action={neverResolve} hintTelegram={null} />,
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("form not found");
    fireEvent.submit(form);
    await waitFor(() =>
      expect(screen.getByRole("button")).toBeDisabled(),
    );
  });

  it("shows the error returned by the action", async () => {
    const action = vi.fn().mockResolvedValue({ error: "Form failed" });
    const { container } = render(
      <OnboardForm action={action} hintTelegram={null} />,
    );
    const form = container.querySelector("form");
    if (!form) throw new Error("form not found");
    fireEvent.submit(form);
    await waitFor(() =>
      expect(screen.getByText(/form failed/i)).toBeInTheDocument(),
    );
  });
});
