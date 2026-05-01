import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GdprPanel } from "@/app/components/GdprPanel";

interface UrlWithBlobApi {
  createObjectURL?: (blob: Blob) => string;
  revokeObjectURL?: (url: string) => void;
}

const originalCreate = (URL as unknown as UrlWithBlobApi).createObjectURL;
const originalRevoke = (URL as unknown as UrlWithBlobApi).revokeObjectURL;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  (URL as unknown as UrlWithBlobApi).createObjectURL = originalCreate;
  (URL as unknown as UrlWithBlobApi).revokeObjectURL = originalRevoke;
});

describe("GdprPanel", () => {
  beforeEach(() => {
    // jsdom doesn't implement URL.createObjectURL — assign instead of spyOn.
    (URL as unknown as UrlWithBlobApi).createObjectURL = () => "blob:mock";
    (URL as unknown as UrlWithBlobApi).revokeObjectURL = () => undefined;
    // HTMLAnchorElement.click triggers navigation in jsdom; stub it.
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      () => undefined,
    );
  });

  it("renders both buttons and the section heading", () => {
    render(<GdprPanel />);
    expect(
      screen.getByRole("heading", { name: /data controls/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /export my data/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete my data/i }),
    ).toBeInTheDocument();
  });

  it("calls /api/me/export and reports success on click", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response('{"handle":"x"}', {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    render(<GdprPanel />);
    fireEvent.click(screen.getByRole("button", { name: /export my data/i }));
    await waitFor(() => {
      expect(screen.getByText(/exported/i)).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/me/export");
  });

  it("surfaces the response error text when export fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("nope", { status: 500 }),
    );
    render(<GdprPanel />);
    fireEvent.click(screen.getByRole("button", { name: /export my data/i }));
    await waitFor(() => {
      expect(screen.getByText(/error: nope/i)).toBeInTheDocument();
    });
  });

  it("requires window.confirm before calling delete", async () => {
    const fetchMock = vi.spyOn(global, "fetch");
    vi.spyOn(window, "confirm").mockReturnValueOnce(false);
    render(<GdprPanel />);
    fireEvent.click(screen.getByRole("button", { name: /delete my data/i }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls /api/me/delete and reports success when confirmed", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response('{"ok":true}', { status: 200 }),
    );
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    render(<GdprPanel />);
    fireEvent.click(screen.getByRole("button", { name: /delete my data/i }));
    await waitFor(() => {
      expect(screen.getByText(/deleted\./i)).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/me/delete", {
      method: "POST",
    });
  });

  it("surfaces the response error text when delete fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("forbidden", { status: 403 }),
    );
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    render(<GdprPanel />);
    fireEvent.click(screen.getByRole("button", { name: /delete my data/i }));
    await waitFor(() => {
      expect(screen.getByText(/error: forbidden/i)).toBeInTheDocument();
    });
  });
});
