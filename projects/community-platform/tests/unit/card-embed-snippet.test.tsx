import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { CardEmbedSnippet } from "@/app/components/CardEmbedSnippet";

afterEach(cleanup);

const SNIPPET =
  "![Jane D — Subploters](https://warsaw-ai-community-platform.vercel.app/members/jane-d/opengraph-image)";

function mockClipboard(): ReturnType<typeof vi.fn> {
  const writeText = vi.fn(async () => undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

describe("CardEmbedSnippet (Phase 4.3)", () => {
  it("renders the markdown embed snippet for the member", () => {
    mockClipboard();
    render(<CardEmbedSnippet name="Jane D" slug="jane-d" />);
    expect(screen.getByTestId("card-embed-snippet").textContent).toBe(SNIPPET);
  });

  it("copies the snippet and flips the button label to 'copied'", async () => {
    const writeText = mockClipboard();
    render(<CardEmbedSnippet name="Jane D" slug="jane-d" />);
    fireEvent.click(screen.getByRole("button", { name: /copy snippet/i }));
    expect(writeText).toHaveBeenCalledWith(SNIPPET);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /copied/i }),
      ).toBeInTheDocument();
    });
  });
});
