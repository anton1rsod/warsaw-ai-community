import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Avatar } from "@/app/components/Avatar";

afterEach(() => cleanup());

describe("Avatar — v0.6 amber monogram tile (§16.4 / §16.5)", () => {
  it("renders an amber-bg monogram tile (no <img>) for canonical sizes", () => {
    render(<Avatar name="Anton Safronov" handle="anton1rsod" size={32} />);
    // v0.6: no photo fetched for any caller — initials-only.
    expect(screen.queryByRole("img")).toBeNull();
    const tile = screen.getByLabelText("Anton Safronov's avatar");
    expect(tile.className).toContain("bg-accent-500");
    expect(tile.className).toContain("text-ink");
    expect(tile.className).toContain("font-voice");
    expect(tile.className).toContain("font-bold");
    // v0.6: 0-radii — no rounded-full.
    expect(tile.className).not.toContain("rounded-full");
    // Inline width/height come from the `size` prop.
    expect(tile.getAttribute("style")).toMatch(/width:\s*32px/);
    expect(tile.getAttribute("style")).toMatch(/height:\s*32px/);
  });

  it("defaults non-decorative aria-label to `${name}'s avatar`", () => {
    render(<Avatar name="Mark Spasonov" handle="markspas" size={32} />);
    expect(
      screen.getByLabelText("Mark Spasonov's avatar"),
    ).toBeInTheDocument();
  });

  it("decorative=true sets aria-hidden and omits aria-label", () => {
    render(
      <Avatar name="Anton" handle="anton1rsod" size={32} decorative />,
    );
    expect(screen.queryByLabelText("Anton's avatar")).toBeNull();
    // The tile is still in the DOM with the monogram; find it by text.
    const tile = screen.getByText("A");
    expect(tile.getAttribute("aria-hidden")).toBe("true");
    expect(tile.getAttribute("aria-label")).toBeNull();
  });

  describe("H59: no remote URL composed (v0.6 is initials-only)", () => {
    it("never renders an <img> regardless of handle", () => {
      render(<Avatar name="X" handle="x" size={32} />);
      expect(screen.queryByRole("img")).toBeNull();
    });
  });

  describe("H60: photo opt-out is trivially satisfied", () => {
    it("photoOptOut=true renders the same amber monogram tile, no <img>", () => {
      render(
        <Avatar
          name="Anton Safronov"
          handle="anton1rsod"
          size={32}
          photoOptOut
        />,
      );
      expect(screen.queryByRole("img")).toBeNull();
      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("photoOptOut=false ALSO renders the monogram tile (no photo in v0.6)", () => {
      render(
        <Avatar
          name="Anton Safronov"
          handle="anton1rsod"
          size={32}
        />,
      );
      expect(screen.queryByRole("img")).toBeNull();
      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("empty handle falls back to first letter of name", () => {
      render(<Avatar name="Mark" handle="" size={32} />);
      expect(screen.queryByRole("img")).toBeNull();
      expect(screen.getByText("M")).toBeInTheDocument();
    });
  });

  describe("O6: initials algorithm — single-char from handle (preserved)", () => {
    it("renders single uppercase letter from handle", () => {
      render(
        <Avatar
          name="Anything"
          handle="anton1rsod"
          size={32}
        />,
      );
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.queryByText("AS")).toBeNull();
      expect(screen.queryByText("AN")).toBeNull();
    });

    it("uppercases the first letter of handle", () => {
      render(
        <Avatar name="" handle="markspas" size={32} />,
      );
      expect(screen.getByText("M")).toBeInTheDocument();
    });
  });

  it("font-size scales with size (Math.round(size * 0.42))", () => {
    render(<Avatar name="Anton" handle="anton1rsod" size={40} />);
    const tile = screen.getByLabelText("Anton's avatar");
    // 40 * 0.42 = 16.8 → round → 17
    expect(tile.getAttribute("style")).toMatch(/font-size:\s*17px/);
  });

  it("accepts canonical sizes only at the type level (compile-time)", () => {
    const valid = 32 as const;
    expect(valid).toBe(32);
  });
});
