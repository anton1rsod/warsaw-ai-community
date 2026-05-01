import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConsentModal } from "@/app/components/ConsentModal";

afterEach(() => {
  cleanup();
});

describe("ConsentModal", () => {
  it("renders consent text + accept + cancel buttons", () => {
    render(<ConsentModal onAccept={vi.fn()} onCancel={vi.fn()} disabled={false} />);
    expect(
      screen.getByRole("heading", { name: /opt in/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /accept/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancel/i }),
    ).toBeInTheDocument();
  });

  it("calls onAccept and onCancel on click", () => {
    const onAccept = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConsentModal
        onAccept={onAccept}
        onCancel={onCancel}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons when disabled prop is true", () => {
    render(
      <ConsentModal onAccept={vi.fn()} onCancel={vi.fn()} disabled={true} />,
    );
    expect(screen.getByRole("button", { name: /accept/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  it("explains what consent covers (status updates, OSS license, export/delete)", () => {
    render(<ConsentModal onAccept={vi.fn()} onCancel={vi.fn()} disabled={false} />);
    // Smoke-check the list items the modal must show — these are not
    // legally binding but they encode the spec §6.11 user-facing
    // promise so a future copy edit can't accidentally drop them.
    expect(screen.getByText(/public.*repository/i)).toBeInTheDocument();
    expect(screen.getByText(/edit.*delete/i)).toBeInTheDocument();
    expect(screen.getByText(/export.*deletion/i)).toBeInTheDocument();
  });
});
