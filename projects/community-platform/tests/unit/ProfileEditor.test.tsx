import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileEditor } from "@/app/components/ProfileEditor";

const saveMock = vi.fn();
vi.mock("@/app/actions/save-profile", () => ({
  saveProfile: (fd: FormData) => saveMock(fd),
}));

// SafeHtml mock: represents the contract that ProfileEditor must use SafeHtml
// for all HTML insertion. The mock itself uses dangerouslySetInnerHTML only in
// test scope so we can assert the boundary is in place.
vi.mock("@/app/components/SafeHtml", () => ({
   
  SafeHtml: ({ html, className }: { html: string; className?: string }) => (
    <div
      data-testid="safehtml"
      className={className}
      // Test-only: safe because html comes from a controlled server endpoint
      // (sanitized by rehype-sanitize in preview-markdown route) and this mock
      // is only used in jsdom test scope, never in a real browser.
      // nosec: test-only mock of SafeHtml boundary contract
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ),
}));

const fetchMock = vi.fn();

beforeEach(() => {
  saveMock.mockReset();
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  localStorage.clear();
});
afterEach(cleanup);

const baseProps = {
  initialBody: "Original prose.",
  slug: "anton-safronov",
  previewEndpoint: "/api/preview-markdown",
} as const;

const DRAFT_KEY = "warsaw-profile-draft-anton-safronov";

describe("ProfileEditor", () => {
  it("renders the textarea with the initial body", () => {
    render(<ProfileEditor {...baseProps} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Original prose.");
  });

  describe("H23: draft data stays local", () => {
    it("does not call fetch when the user types in the textarea", async () => {
      render(<ProfileEditor {...baseProps} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "Original prose. More." } });
      // Wait for any pending effects/transitions to settle, then check fetch
      await waitFor(() => {
        expect(textarea.value).toBe("Original prose. More.");
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("writes draft to localStorage on change", async () => {
      render(<ProfileEditor {...baseProps} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "Original prose. More." } });
      await waitFor(() => {
        const raw = localStorage.getItem(DRAFT_KEY);
        expect(raw).toContain(" More.");
      });
    });

    it("restores draft from localStorage on mount (and shows banner)", async () => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ body: "Restored content.", at: Date.now() }),
      );
      render(<ProfileEditor {...baseProps} />);
      await waitFor(() => {
        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        expect(textarea.value).toBe("Restored content.");
      });
      expect(screen.getByText(/Restored draft/i)).toBeInTheDocument();
    });

    it("ignores corrupt JSON in the draft slot (falls back to initialBody)", async () => {
      localStorage.setItem(DRAFT_KEY, "{ not valid json");
      render(<ProfileEditor {...baseProps} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Original prose.");
      expect(screen.queryByText(/Restored draft/i)).not.toBeInTheDocument();
    });

    it("clears draft on successful save", async () => {
      saveMock.mockResolvedValue({ ok: true, savedAt: new Date().toISOString() });
      render(<ProfileEditor {...baseProps} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "Original prose. Edit." } });
      const saveBtn = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveBtn);
      await waitFor(() => {
        expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
      });
    });

    it("Discard draft button clears the local draft + resets body to initialBody", async () => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ body: "Stale.", at: Date.now() }),
      );
      render(<ProfileEditor {...baseProps} />);
      await waitFor(() => {
        expect(screen.getByText(/Restored draft/i)).toBeInTheDocument();
      });
      const discardBtn = screen.getByRole("button", { name: /discard/i });
      fireEvent.click(discardBtn);
      expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Original prose.");
    });
  });

  describe("H14: profile prose XSS-safe at render", () => {
    it("Preview tab renders via the /api/preview-markdown endpoint (no client-side HTML insertion outside SafeHtml)", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ html: "<h1>Hello</h1>" }),
      });
      render(<ProfileEditor {...baseProps} />);
      const previewTab = screen.getByRole("tab", { name: /preview/i });
      fireEvent.click(previewTab);
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          "/api/preview-markdown",
          expect.objectContaining({ method: "POST" }),
        );
      });
      await waitFor(() => {
        expect(screen.getByTestId("safehtml")).toBeInTheDocument();
      });
    });
  });

  describe("Preview tab error paths", () => {
    it("renders 'Preview unavailable' when the preview endpoint returns non-2xx", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });
      render(<ProfileEditor {...baseProps} />);
      const previewTab = screen.getByRole("tab", { name: /preview/i });
      fireEvent.click(previewTab);
      await waitFor(() => {
        expect(screen.getByTestId("safehtml")).toBeInTheDocument();
      });
      // The fallback HTML string contains "Preview unavailable" — assert content.
      const safehtml = screen.getByTestId("safehtml");
      expect(safehtml.innerHTML).toContain("Preview unavailable");
    });
  });

  describe("post-save UX (rebuild-lag message)", () => {
    it("shows the rebuild-lag message after a successful save", async () => {
      saveMock.mockResolvedValue({ ok: true, savedAt: new Date().toISOString() });
      render(<ProfileEditor {...baseProps} />);
      const saveBtn = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveBtn);
      await waitFor(() => {
        expect(screen.getByText(/rebuilding.*60.*90s/i)).toBeInTheDocument();
      });
    });
  });

  describe("save error paths", () => {
    it("shows 'Someone else updated' when error is refresh_needed", async () => {
      saveMock.mockResolvedValue({ ok: false, error: "refresh_needed" });
      render(<ProfileEditor {...baseProps} />);
      const saveBtn = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveBtn);
      await waitFor(() => {
        expect(screen.getByText(/Someone else updated/i)).toBeInTheDocument();
      });
    });

    it("shows 'Save failed (<code>)' for other errors", async () => {
      saveMock.mockResolvedValue({ ok: false, error: "invalid_body" });
      render(<ProfileEditor {...baseProps} />);
      const saveBtn = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveBtn);
      await waitFor(() => {
        expect(screen.getByText(/Save failed \(invalid_body\)/i)).toBeInTheDocument();
      });
    });
  });
});
