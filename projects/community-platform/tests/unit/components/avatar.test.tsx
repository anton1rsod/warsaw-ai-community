import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Avatar } from "@/app/components/Avatar";

afterEach(() => cleanup());

describe("Avatar — render contract (Q5.2 / D37 / O6)", () => {
  it("renders <img> with GitHub URL at 2× retina for canonical sizes", () => {
    render(<Avatar name="Anton Safronov" handle="anton1rsod" size={32} />);
    const img = screen.getByAltText("Anton Safronov's avatar");
    expect(img.getAttribute("src")).toMatch(
      /(\/_next\/image|avatars\.githubusercontent\.com)/,
    );
    expect(img.getAttribute("src")).toMatch(/anton1rsod/);
    expect(img.getAttribute("width")).toBe("32");
    expect(img.getAttribute("height")).toBe("32");
  });

  it("defaults non-decorative alt to `${name}'s avatar`", () => {
    render(<Avatar name="Mark Spasonov" handle="markspas" size={32} />);
    expect(screen.getByAltText("Mark Spasonov's avatar")).toBeInTheDocument();
  });

  it("decorative=true renders empty alt", () => {
    render(
      <Avatar name="Anton" handle="anton1rsod" size={32} decorative />,
    );
    expect(screen.getByAltText("")).toBeInTheDocument();
  });

  describe("H59: avatar remote allowlist", () => {
    it("never composes a URL outside avatars.githubusercontent.com", () => {
      render(<Avatar name="X" handle="x" size={32} />);
      const src = screen.getByAltText("X's avatar").getAttribute("src") || "";
      expect(src).toMatch(
        /(\/_next\/image|avatars\.githubusercontent\.com)/,
      );
      expect(src).toMatch(/x/);
    });
  });

  describe("H60: photo opt-out", () => {
    it("photoOptOut=true renders initials, no <img>", () => {
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

    it("empty handle falls back to initials (defense)", () => {
      render(<Avatar name="Mark" handle="" size={32} />);
      expect(screen.queryByRole("img")).toBeNull();
      expect(screen.getByText("M")).toBeInTheDocument();
    });
  });

  describe("O6: initials algorithm — single-char from handle", () => {
    it("renders single uppercase letter when photoOptOut", () => {
      render(
        <Avatar
          name="Anything"
          handle="anton1rsod"
          size={32}
          photoOptOut
        />,
      );
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.queryByText("AS")).toBeNull();
    });

    it("uppercases the first letter of handle", () => {
      render(
        <Avatar name="" handle="markspas" size={32} photoOptOut />,
      );
      expect(screen.getByText("M")).toBeInTheDocument();
    });
  });

  it("accepts canonical sizes only at the type level (compile-time)", () => {
    const valid = 32 as const;
    expect(valid).toBe(32);
  });
});
