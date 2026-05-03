import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InviteUrlDisplay } from "@/app/components/InviteUrlDisplay";

afterEach(cleanup);

describe("InviteUrlDisplay", () => {
  it("renders the URL in a read-only field", () => {
    render(<InviteUrlDisplay url="https://example.com/onboard?token=abc" />);
    const field = screen.getByRole("textbox") as HTMLInputElement;
    expect(field.value).toBe("https://example.com/onboard?token=abc");
    expect(field.readOnly).toBe(true);
  });
  it("renders nothing when url is null/empty (idle state)", () => {
    const { container } = render(<InviteUrlDisplay url={null} />);
    expect(container.firstChild).toBeNull();
  });
  it("provides a 'copy' button", () => {
    render(<InviteUrlDisplay url="https://example.com/onboard?token=abc" />);
    const btn = screen.getByRole("button", { name: /copy/i });
    expect(btn).toBeInTheDocument();
  });
  it("calls navigator.clipboard.writeText when copy is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<InviteUrlDisplay url="https://example.com/onboard?token=abc" />);
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    expect(writeText).toHaveBeenCalledWith(
      "https://example.com/onboard?token=abc",
    );
  });

  it("flips button text to 'Copied!' once the writeText promise resolves", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<InviteUrlDisplay url="https://example.com/onboard?token=abc" />);
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /copied!/i }),
      ).toBeInTheDocument(),
    );
  });

  it("swallows clipboard rejection and stays in non-copied state", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<InviteUrlDisplay url="https://example.com/onboard?token=abc" />);
    const btn = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(btn);
    // Wait one microtask so the catch executes; button stays "Copy".
    await Promise.resolve();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalled();
    expect(btn).toHaveTextContent(/^copy$/i);
  });
});
