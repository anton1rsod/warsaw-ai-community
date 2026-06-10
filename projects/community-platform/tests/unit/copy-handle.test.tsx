import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, afterEach, vi } from "vitest";
import { CopyHandle } from "@/app/components/CopyHandle";

afterEach(cleanup);

describe("CopyHandle (O2 fallback when roster has no Telegram)", () => {
  it("copies @handle via the clipboard API and flips the label to copied", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<CopyHandle handle="markspas" />);
    const btn = screen.getByRole("button", { name: /copy @markspas/i });
    fireEvent.click(btn);
    expect(writeText).toHaveBeenCalledWith("@markspas");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument(),
    );
  });
});
