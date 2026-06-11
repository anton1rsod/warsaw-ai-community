import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { CopyHandle } from "@/app/components/CopyHandle";

afterEach(cleanup);

const writeText = vi.fn(async (): Promise<void> => undefined);
beforeEach(() => {
  writeText.mockClear();
  writeText.mockResolvedValue(undefined);
  // jsdom has no navigator.clipboard — install a mock per test run.
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
});

describe("CopyHandle (O2 fallback)", () => {
  it("renders the copy label with the handle", () => {
    render(<CopyHandle handle="markspas" />);
    expect(screen.getByRole("button", { name: "copy @markspas" })).toBeInTheDocument();
  });

  it("copies @handle to the clipboard and flips the label via i18n copiedHandle", async () => {
    render(<CopyHandle handle="markspas" />);
    fireEvent.click(screen.getByRole("button", { name: "copy @markspas" }));
    expect(writeText).toHaveBeenCalledWith("@markspas");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "copied" })).toBeInTheDocument(),
    );
  });

  it("keeps the copy label when the clipboard write rejects", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    render(<CopyHandle handle="markspas" />);
    fireEvent.click(screen.getByRole("button", { name: "copy @markspas" }));
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "copy @markspas" })).toBeInTheDocument();
  });

  it("H159: 24px min hit area", () => {
    render(<CopyHandle handle="markspas" />);
    expect(screen.getByRole("button").className).toContain("min-h-[24px]");
  });
});
