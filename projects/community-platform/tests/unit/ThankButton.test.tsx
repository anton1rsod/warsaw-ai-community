import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockAction = vi.fn();
vi.mock("@/app/actions/thank-status", () => ({
  thankStatus: (...args: unknown[]) => mockAction(...args),
}));

import { ThankButton } from "@/app/components/ThankButton";

beforeEach(() => {
  mockAction.mockReset();
});
afterEach(cleanup);

describe("D19: ThankButton states", () => {
  it("not-thanked: shows '+ Thanks' clickable", () => {
    render(
      <ThankButton
        recipient="bob"
        itemType="status"
        itemId="x"
        initialState="not-thanked"
        profileSha="abc"
      />,
    );
    expect(
      screen.getByRole("button", { name: /\+ Thanks/i }),
    ).toBeInTheDocument();
  });

  it("thanked: shows '♥ Thanked', click is a no-op", () => {
    render(
      <ThankButton
        recipient="bob"
        itemType="status"
        itemId="x"
        initialState="thanked"
        profileSha="abc"
      />,
    );
    const btn = screen.getByRole("button", { name: /♥ Thanked/i });
    fireEvent.click(btn);
    expect(mockAction).not.toHaveBeenCalled();
  });

  it("self: returns null (component renders nothing)", () => {
    const { container } = render(
      <ThankButton
        recipient="alice"
        itemType="status"
        itemId="x"
        initialState="self"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("not-signed-in: renders sign-in CTA link", () => {
    render(
      <ThankButton
        recipient="bob"
        itemType="status"
        itemId="x"
        initialState="not-signed-in"
      />,
    );
    expect(
      screen.getByRole("link", { name: /Sign in to thank/i }),
    ).toHaveAttribute("href", "/login?callbackUrl=/this-week");
  });
});

describe("D19: ThankButton optimistic + duplicate no-op + 409 revert", () => {
  it("click → optimistic flip → ok=true commits state", async () => {
    mockAction.mockResolvedValue({ ok: true });
    render(
      <ThankButton
        recipient="bob"
        itemType="status"
        itemId="x"
        initialState="not-thanked"
        profileSha="abc"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /♥ Thanked/i }),
      ).toBeInTheDocument(),
    );
    expect(mockAction).toHaveBeenCalledWith({
      recipient: "bob",
      item_type: "status",
      item_id: "x",
      profileSha: "abc",
    });
  });

  it("already_thanked=true from server → stays in thanked state", async () => {
    mockAction.mockResolvedValue({ ok: true, already_thanked: true });
    render(
      <ThankButton
        recipient="bob"
        itemType="status"
        itemId="x"
        initialState="not-thanked"
        profileSha="abc"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /♥ Thanked/i }),
      ).toBeInTheDocument(),
    );
  });

  it("refresh_needed reverts + shows refresh message", async () => {
    mockAction.mockResolvedValue({ ok: false, error: "refresh_needed" });
    render(
      <ThankButton
        recipient="bob"
        itemType="status"
        itemId="x"
        initialState="not-thanked"
        profileSha="abc"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(
        screen.getByText(/Refresh and try again/i),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: /\+ Thanks/i }),
    ).toBeInTheDocument();
  });

  it("other error reverts + shows generic message", async () => {
    mockAction.mockResolvedValue({ ok: false, error: "internal_error" });
    render(
      <ThankButton
        recipient="bob"
        itemType="status"
        itemId="x"
        initialState="not-thanked"
        profileSha="abc"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByText(/Could not save/i)).toBeInTheDocument(),
    );
  });

  it("missing profileSha → click is a no-op", () => {
    render(
      <ThankButton
        recipient="bob"
        itemType="status"
        itemId="x"
        initialState="not-thanked"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(mockAction).not.toHaveBeenCalled();
  });
});
